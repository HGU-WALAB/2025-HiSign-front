import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/entry.webpack";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import Drop from "../components/Drop";
import PasswordInputSection from "../components/SetupTask/PasswordInputSection";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { taskState } from "../recoil/atom/taskState";
import { ButtonContainer, GrayButton, InputRow, Label, NextButton, StyledBody } from "../styles/CommonStyles";

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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(false);
  
  const navigate = useNavigate();

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
      if (!selectedSubject || !selectedMonth) {
        alert("과목명과 월을 모두 선택해 주세요.");
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
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isoExpiration = sevenDaysLater.toISOString().slice(0, 19);
    const formattedExpiration = isoExpiration; // 항상 7일 후로 고정
    const finalRequestName =
      taskType === "taTask"
        ? `${selectedSubject}_${selectedMonth}_${member.name}_${member.uniqueId}`
        : requestName;
    const isRejectableFinal = taskType === "taTask" ? 1 : isRejectable;
    const type = taskType === "taTask" ? 1 : 0;
    const finalDescription =
      taskType === "taTask" ? `[${selectedSubject}] ${selectedMonth} TA 근무일지 입니다.` : description;
    const finalPassword = taskType === "taTask" ? "NONE" : password;
    setTaskState((prev) => ({
      ...prev,
      requestName: finalRequestName,
      description: finalDescription,
      isRejectable: isRejectableFinal,
      expirationDateTime: formattedExpiration,
      type,
      password: finalPassword,
    }));
  
    navigate(`/request`);
  };

  return (
    <OptimizedContainer>
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
                        <option value="3D디지털 콘텐츠제작">3D 디지털 콘텐츠 제작</option>
                        <option value="3D 프린터">3D 프린터</option>
                        <option value="AI개론">AI개론</option>
                        <option value="AI기반 경영 캡스톤">AI기반 경영 캡스톤</option>
                        <option value="Algorithms Analysis">Algorithms Analysis</option>
                        <option value="C 프로그래밍">C 프로그래밍</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Database System">Database System</option>
                        <option value="HSF">HSF</option>
                        <option value="IoT실습">IoT실습</option>
                        <option value="Java Programming">Java Programming</option>
                        <option value="Logic Design">Logic Design</option>
                        <option value="Operating Systems">Operating Systems</option>
                        <option value="Python 프로그래밍">Python 프로그래밍</option>
                        <option value="RF회로 설계">RF회로 설계</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="객체지향 설계패턴">객체지향 설계패턴</option>
                        <option value="공학수학">공학수학</option>
                        <option value="교양특론3">교양특론3</option>
                        <option value="기초회로 및 논리실습">기초회로 및 논리실습</option>
                        <option value="논리설계">논리설계</option>
                        <option value="데이타구조">데이타구조</option>
                        <option value="디지털신호처리">디지털신호처리</option>
                        <option value="딥러닝 개론">딥러닝 개론</option>
                        <option value="마이크로프로세서응용">마이크로프로세서응용</option>
                        <option value="모바일 앱 개발">모바일 앱 개발</option>
                        <option value="소트프웨어 입문">소트프웨어 입문</option>
                        <option value="스타트업 제품 기획 및 개발">스타트업 제품 기획 및 개발</option>
                        <option value="아이디어 개발 및 프로토타이핑">아이디어 개발 및 프로토타이핑</option>
                        <option value="알고리듬분석">알고리듬분석</option>
                        <option value="운영체제">운영체제</option>
                        <option value="자바프로그래밍언어">자바프로그래밍언어</option>
                        <option value="전자회로 1">전자회로 1</option>
                        <option value="전자회로 및 통신실습">전자회로 및 통신실습</option>
                        <option value="직업과 진로설계(전산전자)">직업과 진로설계(전산전자)</option>
                        <option value="캡스톤디자인1">캡스톤디자인1</option>
                        <option value="캡스톤디자인2">캡스톤디자인2</option>
                        <option value="컴퓨터 및 전자공학개론">컴퓨터 및 전자공학개론</option>
                        <option value="컴퓨터그래픽스">컴퓨터그래픽스</option>
                        <option value="코딩테스트 서버관리">코딩테스트 서버관리</option>
                        <option value="통신이론">통신이론</option>
                        <option value="파이썬 프로그래밍">파이썬 프로그래밍</option>
                        <option value="프로그래밍 스튜디오">프로그래밍 스튜디오</option>
                        <option value="프로그래밍1">프로그래밍1</option>
                        <option value="프론트엔드 입문">프론트엔드 입문</option>
                        <option value="회로이론">회로이론</option>
                      </Select>
                    </FormRow>
                    <FormRow>
                      <Label>
                        월 <RequiredMark>*</RequiredMark>
                      </Label>
                      <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        <option value="">월 선택하세요.</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={`${i + 1}월`}>
                            {i + 1}월
                          </option>
                        ))}
                      </Select>
                    </FormRow>
                  </FormCard>
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
                    문서 선택 <RequiredMark>*</RequiredMark>
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
        <GrayButton onClick={() => navigate(`/request-document`)}>
          나가기
        </GrayButton>
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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