import { Typography } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/entry.webpack";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import Drop from "../components/Drop";
import PasswordInputSection from "../components/SetupTask/PasswordInputSection";
import StepProgressBar from "../components/StepProgressBar";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { taskState } from "../recoil/atom/taskState";
import { GrayButton, Label, NextButton, StyledBody } from "../styles/CommonStyles";
import ApiService from "../utils/ApiService";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const SetupTaskPage = () => {
  const [document, setTaskState] = useRecoilState(taskState);
  const member = useRecoilValue(loginMemberState);
  const [requestName, setRequestName] = useState("");
  const [description, setDescription] = useState("");
  const [isRejectable, setIsRejectable] = useState(0);
  const [expirationDate, setExpirationDate] = useState("");
  const [expirationTime, setExpirationTime] = useState("23:59");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [expirationOption, setExpirationOption] = useState("custom");
  const [taskType, setTaskType] = useState("taTask");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(false);
  const navigate = useNavigate();

  // 현재 날짜 기준 값
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  // 상태: 기본값을 현재 년/월로 설정
  const [selectedYear, setSelectedYear] = useState(String(thisYear));
  const [selectedMonth, setSelectedMonth] = useState(`${thisMonth}월`);

  // 년도 옵션: 현재년도 ~ 현재년도-5 (총 6개)
  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => String(thisYear - i)),
    [thisYear]
  );
  
  useEffect(() => {
    if (document) {
      setSelectedSubject(document.selectedSubject || "");
      setRequestName(document.requestName || "");
      setDescription(document.description || "");
      setIsRejectable(document.isRejectable ?? 0);
  
      if (document.expirationDateTime) {
        const [datePart, timePart] = document.expirationDateTime.split("T");
        setExpirationDate(datePart);
        setExpirationTime(timePart?.slice(0, 5) || "23:59");
      }
    }

    ApiService.getSubjects()
    .then((subjects) => setSubjectList(subjects))
    .catch(() => alert("과목 목록을 불러오지 못했습니다."));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const calculateExpirationDate = (option) => {
    const now = new Date();
    switch (option) {
      case "today":
        return now.toISOString().split("T")[0];
      case "threeDays":
        now.setDate(now.getDate() + 3);
        return now.toISOString().split("T")[0];
      case "oneWeek":
        now.setDate(now.getDate() + 7);
        return now.toISOString().split("T")[0];
      default:
        return expirationDate;
    }
  };

  const handleExpirationOptionChange = (option) => {
    setExpirationOption(option);
    const newDate = calculateExpirationDate(option);
    setExpirationDate(newDate);
  };

  const handlePostFiles = (file) => {
    if (!file) return alert("파일을 선택해주세요.");
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setTaskState((prev) => ({
      ...prev,
      ownerId: member.uniqueId,
      fileName: file.name,
      fileUrl: blobUrl,
    }));
  };

  const handleNextStep = () => {
    if (taskType === "taTask") {
      if (!selectedSubject) {
        alert("과목명을 선택해 주세요.");
        return;
      }
      if (!document.fileUrl) {
        alert("문서를 선택해 주세요.");
        return;
      }
    }
  
    if (taskType === "basicTask") {
      if (!requestName.trim()) {
        alert("작업명을 입력해 주세요.");
        return;
      }
      if (!description.trim()) {
        alert("문서 설명을 입력해 주세요.");
        return;
      }
      if (!document.fileUrl) {
        alert("문서를 선택해 주세요.");
        return;
      }

      if (!password || password.length !== 5 || !/^\d{5}$/.test(password)) {
        alert("유효한 인증 비밀번호를 입력해 주세요. (숫자 5자리)");
        return;
      }
      
      if (!passwordMatch) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
  
    const now = new Date();
    let expiration = new Date();

    if (taskType === "taTask") {
      expiration.setDate(now.getDate() + 30);
      expiration.setHours(17, 0, 0, 0);
    } else {
      // basicTask인 경우, 사용자가 지정한 날짜 + 시간 사용
      const [year, month, day] = expirationDate.split("-").map(Number);
      const [hour, minute] = expirationTime.split(":").map(Number);
      expiration = new Date(year, month - 1, day, hour, minute);
    }
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간 in ms
    const kstDate = new Date(expiration.getTime() + kstOffset);
    const formattedExpiration = kstDate.toISOString().slice(0, 19);
    //console.log("만료일:", formattedExpiration);
    const finalRequestName =
      taskType === "taTask"
        ? `${selectedSubject}_${selectedYear}_${selectedMonth}_${member.name}_${member.uniqueId}`
        : requestName;
    const isRejectableFinal = taskType === "taTask" ? 1 : isRejectable;
    const type = taskType === "taTask" ? 1 : 0;
    const finalDescription =
      taskType === "taTask" ? `[${selectedSubject}] ${selectedYear}년 ${selectedMonth} TA 근무일지 입니다.` : description;
    const finalPassword = taskType === "taTask" ? "NONE" : password;
    setTaskState((prev) => ({
      ...prev,
      requestName: finalRequestName,
      description: finalDescription,
      isRejectable: isRejectableFinal,
      expirationDateTime: formattedExpiration,
      type,
      password: finalPassword,
      selectedSubject,
      selectedMonth,
    }));
  
    navigate(`/request`);
  };

  const handleExit = () => {
    if(window.confirm('정말로 나가시겠습니까?\n나가시면 진행상황은 초기화 됩니다.')){
      setTaskState({
      requestName: '',
      description: '',
      ownerId: null,
      fileName: '',
      fileUrl: null,
      isRejectable : null,
      type: null,
      password: null,
    });
    navigate(`/request-document`);
    }
  }; 

  return (
    <OptimizedContainer>
      <StepProgressBar currentStep={0} />
      <StyledBody>
        <OptimizedMainArea>
          <PageHeader>
            <Title>작업 정보 입력</Title>
            <RequiredNotice>* 항목은 필수 입력란입니다.</RequiredNotice>
          </PageHeader>
          
          <FormSection>
            <TaskTypeSelector>
              <RadioGroup
                name="use-radio-group"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                row
              >
                <FormControlLabel
                  value="taTask"
                  control={<Radio />}
                  label={<span style={{ fontSize: "14px" }}>TA 근무일지 작업</span>}
                />
                <FormControlLabel
                  value="basicTask"
                  control={<Radio />}
                  label={<span style={{ fontSize: "14px" }}>기본 작업</span>}
                />
              </RadioGroup>
            </TaskTypeSelector>

            <TwoColumnLayout>
              <LeftColumn>
                {taskType === "taTask" && (
                  <>
                  <FormCard>
                    <CardTitle>TA 근무일지 정보</CardTitle>
                    <FormRow>
                      <Label>
                        과목명 <RequiredMark>*</RequiredMark>
                      </Label>
                      <Select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                      >
                        <option value="">과목을 선택하세요.</option>
                        {subjectList.map((subject, index) => (
                          <option key={index} value={subject}>{subject}</option>
                        ))}
                      </Select>
                    </FormRow>
                    <div style={{display: "flex", gap: "10px"}}>
                      <FormRow>
                        <Label>
                          근무년도 <RequiredMark>*</RequiredMark>
                        </Label>
                        <Select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </Select>
                      </FormRow>
                      <FormRow>
                        <Label>
                          근무 월 <RequiredMark>*</RequiredMark>
                        </Label>
                        <Select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          {Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </Select>
                      </FormRow>
                    </div>
                  </FormCard>
                  <FormCard>
                    <CardTitle>TA 근무일지 작성 안내</CardTitle>
                    <Typography variant="body2" gutterBottom>• 본인 수업시간 및 주말 또는 휴일 제외하여 근무일지 작성</Typography>
                    <Typography variant="body2" gutterBottom>• 늦은밤이나 새벽시간 근무일시에서 제외하여 기재해야함</Typography>
                    <Typography variant="body2" gutterBottom>• 시험감독, 채점, 과제체크(확인) 등 교수 본연의 업무에 해당되는 내용 작성 금지</Typography>
                    <Typography variant="body2" gutterBottom>• 본인의 월 근로시간 확인 후 맞게 작성(초과작성 불가)</Typography>
                  </FormCard>
                  </>
                )}

                {taskType === "basicTask" && (
                  <>
                    <FormCard>
                      <CardTitle>작업 기본 정보</CardTitle>
                      <FormRow>
                        <Label>
                          작업명 <RequiredMark>*</RequiredMark>
                        </Label>
                        <InputField
                          placeholder="예: 2025년 1학기 팀 MT 계획서"
                          value={requestName}
                          onChange={(e) => setRequestName(e.target.value)}
                        />
                      </FormRow>
                      <FormRow>
                        <Label>
                          작업 요청 설명 <RequiredMark>*</RequiredMark>
                        </Label>
                        <Textarea
                          placeholder="예: 최대한 빠르게 서명을 완료해주세요."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </FormRow>
                      <FormRow>
                        <Label>작업 설정</Label>
                        <RadioContainer>
                          <RadioLabel>
                            <RadioInput
                              type="radio"
                              name="rejectable"
                              value={0}
                              checked={isRejectable === 0}
                              onChange={() => setIsRejectable(0)}
                            />
                            거절 불가능
                          </RadioLabel>
                          <RadioLabel>
                            <RadioInput
                              type="radio"
                              name="rejectable"
                              value={1}
                              checked={isRejectable === 1}
                              onChange={() => setIsRejectable(1)}
                            />
                            거절 가능
                          </RadioLabel>
                        </RadioContainer>
                      </FormRow>
                    </FormCard>
                    
                    <FormCard>
                      <CardTitle>만료 설정</CardTitle>
                      <ExpirationOptionContainer>
                        <ExpirationOptionLabel>
                          <RadioInput
                            type="radio"
                            name="expirationOption"
                            value="today"
                            checked={expirationOption === "today"}
                            onChange={() => handleExpirationOptionChange("today")}
                          />
                          오늘
                        </ExpirationOptionLabel>
                        <ExpirationOptionLabel>
                          <RadioInput
                            type="radio"
                            name="expirationOption"
                            value="threeDays"
                            checked={expirationOption === "threeDays"}
                            onChange={() => handleExpirationOptionChange("threeDays")}
                          />
                          3일 후
                        </ExpirationOptionLabel>
                        <ExpirationOptionLabel>
                          <RadioInput
                            type="radio"
                            name="expirationOption"
                            value="oneWeek"
                            checked={expirationOption === "oneWeek"}
                            onChange={() => handleExpirationOptionChange("oneWeek")}
                          />
                          일주일 후
                        </ExpirationOptionLabel>
                      </ExpirationOptionContainer>
                      <DateTimePickerRow>
                        <DateTimePickerColumn>
                          <DatePickerLabel>
                            만료일 <RequiredMark>*</RequiredMark>
                          </DatePickerLabel>
                          <DatePickerInput
                            type="date"
                            min={today}
                            value={expirationDate}
                            onChange={(e) => {
                              setExpirationDate(e.target.value);
                              setExpirationOption("custom");
                            }}
                          />
                        </DateTimePickerColumn>
                        <DateTimePickerColumn>
                          <DatePickerLabel>
                            만료 시간 <RequiredMark>*</RequiredMark>
                          </DatePickerLabel>
                          <DatePickerInput
                            type="time"
                            value={expirationTime}
                            onChange={(e) => setExpirationTime(e.target.value)}
                          />
                        </DateTimePickerColumn>
                      </DateTimePickerRow>
                      <DatePickerHint>
                        서명 요청이 만료되는 날짜와 시간을 선택하세요. 만료 시점
                        이후에는 서명이 불가합니다.
                      </DatePickerHint>
                    </FormCard>
                    
                    <FormCard>
                      <CardTitle>인증 설정</CardTitle>
                      <PasswordInputSection 
                        onValid={(pw, match) => {
                          setPassword(pw);
                          setPasswordMatch(match);
                        }}
                      />
                    </FormCard>
                  </>
                )}
              </LeftColumn>

              <RightColumn>
                <FormCard>
                  <CardTitle>
                    {taskType === "taTask" ? "근무일지 업로드" : "문서 선택"}
                    <RequiredMark>*</RequiredMark>
                  </CardTitle>
                  <DocumentUploadSection>
                    {!document.fileUrl ? (
                      <Drop
                        onLoaded={(files) => {
                          const file = files[0];
                          if (file) handlePostFiles(file);
                        }}
                      />
                    ) : (
                      <SelectedFileBox>
                        {document.fileUrl && (
                          <Document
                            file={document.fileUrl}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          >
                            <Page pageNumber={1} width={250} />
                          </Document>
                        )}
                        <SelectedFileText>{document.fileName}</SelectedFileText>
                        <FileButtonContainer>
                          <ChangeFileButton
                            onClick={() =>
                              setTaskState((prev) => ({
                                ...prev,
                                fileName: "",
                                fileUrl: null,
                              }))
                            }
                          >
                            다른 문서 선택
                          </ChangeFileButton>
                        </FileButtonContainer>
                      </SelectedFileBox>
                    )}
                  </DocumentUploadSection>
                </FormCard>
              </RightColumn>
            </TwoColumnLayout>
          </FormSection>
        </OptimizedMainArea>
      </StyledBody>
      <FloatingButtonContainer>
        <GrayButton onClick={handleExit}>나가기</GrayButton>
        <NextButton onClick={handleNextStep}>
          다음단계
        </NextButton>
      </FloatingButtonContainer>
    </OptimizedContainer>
  );
};

export default SetupTaskPage;

// 새로운 최적화된 컨테이너 스타일
const OptimizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

// 최적화된 메인 영역
const OptimizedMainArea = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 0;
`;

// 헤더 영역
const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

// 폼 영역
const FormSection = styled.div`
  width: 100%;
`;

// 작업 유형 선택 영역
const TaskTypeSelector = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

// 2열 레이아웃
const TwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  flex-direction: row; // 명시적으로 수평
`;

// 왼쪽 컬럼
const LeftColumn = styled.div`
  flex: 1;
  min-width: 320px;
`;

// 오른쪽 컬럼
const RightColumn = styled.div`
  flex: 1;
  min-width: 320px;
`;

// 카드 폼 디자인
const FormCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0px 8px 5px 7px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
`;

// 카드 제목
const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

// 폼 행
const FormRow = styled.div`
  flex: 1;
  margin-bottom: 15px;
`;

// 제목
const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

// 필수 항목 표시
const RequiredMark = styled.span`
  color: #ff4d4f;
`;

// 필수 항목 안내문
const RequiredNotice = styled.p`
  font-size: 12px;
  color: #888;
  margin-bottom: 15px;
`;

// 셀렉트 박스
const Select = styled.select`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// 인풋 필드
const InputField = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

// 텍스트에리어
const Textarea = styled.textarea`
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  max-height: 200px;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// 라디오 버튼 컨테이너
const RadioContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

// 라디오 라벨
const RadioLabel = styled.label`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

// 라디오 인풋
const RadioInput = styled.input`
  cursor: pointer;
`;

// 만료일 옵션 컨테이너
const ExpirationOptionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
`;

// 만료일 옵션 라벨
const ExpirationOptionLabel = styled.label`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  cursor: pointer;

  &:hover {
    background-color: #e8f0fe;
  }
`;

// 날짜 시간 선택 행
const DateTimePickerRow = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

// 날짜 시간 선택 열
const DateTimePickerColumn = styled.div`
  flex: 1;
  min-width: 140px;
`;

// 날짜 선택 라벨
const DatePickerLabel = styled.label`
  font-size: 14px;
  font-weight: normal;
  color: #333;
  display: block;
  margin-bottom: 5px;
`;

// 날짜 선택 인풋
const DatePickerInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #007bff;
  }
`;

// 날짜 선택 힌트
const DatePickerHint = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

// 문서 업로드 섹션
const DocumentUploadSection = styled.div`
  background-color: transparent;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
`;

// 선택된 파일 박스
const SelectedFileBox = styled.div`
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 선택된 파일 텍스트
const SelectedFileText = styled.span`
  padding-top: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  word-break: break-all;
`;

// 파일 버튼 컨테이너
const FileButtonContainer = styled.div`
  margin-top: 10px;
`;

// 파일 변경 버튼
const ChangeFileButton = styled.button`
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;

// 버튼 하단 고정 컨테이너
const FloatingButtonContainer = styled.div`
  position: sticky;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px 0;
  background-color: transparent;
  z-index: 100;
`;