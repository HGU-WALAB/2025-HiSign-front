import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/entry.webpack";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import Drop from "../components/Drop";
import PasswordInputSection from "../components/SetupTask/PasswordInputSection";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { taskState } from "../recoil/atom/taskState";
import { InputRow, Label, RequiredMark } from "../styles/SetupTaskStyle";

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
      ownerId: member.unique_id,
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
      if (isRejectable === 1) {
        // 더 이상 사용자 입력을 받지 않고 자동으로 7일 후로 고정
      }
    }

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isoExpiration = sevenDaysLater.toISOString().slice(0, 19);
    const formattedExpiration = isoExpiration; // 항상 7일 후로 고정
    const finalRequestName =
      taskType === "taTask"
        ? `${selectedSubject}_${selectedMonth}_${member.name}_${member.unique_id}`
        : requestName;
    const isRejectable = taskType === "taTask" ? 0 : isRejectable;
    const type = taskType === "taTask" ? 1 : 0;
    const finalDescription =
      taskType === "taTask" ? `[${selectedSubject}] ${selectedMonth} TA 근무일지 입니다.` : description;

    setTaskState((prev) => ({
      ...prev,
      requestName: finalRequestName,
      description: taskType === "taTask" ? finalDescription : description,
      isRejectable,
      expirationDateTime: formattedExpiration,
      type,
    }));

    navigate(`/request`);
  };

  useEffect(() => {
    console.log(document);
  }, [document]);

  return (
    <Container>
      <StyledBody>
        <MainArea>
          <Title>작업 정보 입력</Title>
          <RequiredNotice>* 항목은 필수 입력란입니다.</RequiredNotice>
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

          {taskType === "taTask" && (
            <InputRow>
              <Label>
                과목명 <RequiredMark>*</RequiredMark>
              </Label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">과목을 선택하세요.</option>
                <option value="3D디지털 콘텐츠제작">
                  3D 디지털 콘텐츠 제작
                </option>
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
                <option value="Software Engineering">
                  Software Engineering
                </option>
                <option value="객체지향 설계패턴">객체지향 설계패턴</option>
                <option value="공학수학">공학수학</option>
                <option value="교양특론3">교양특론3</option>
                <option value="기초회로 및 논리실습">
                  기초회로 및 논리실습
                </option>
                <option value="논리설계">논리설계</option>
                <option value="데이타구조">데이타구조</option>
                <option value="디지털신호처리">디지털신호처리</option>
                <option value="딥러닝 개론">딥러닝 개론</option>
                <option value="마이크로프로세서응용">
                  마이크로프로세서응용
                </option>
                <option value="모바일 앱 개발">모바일 앱 개발</option>
                <option value="소트프웨어 입문">소트프웨어 입문</option>
                <option value="스타트업 제품 기획 및 개발">
                  스타트업 제품 기획 및 개발
                </option>
                <option value="아이디어 개발 및 프로토타이핑">
                  아이디어 개발 및 프로토타이핑
                </option>
                <option value="알고리듬분석">알고리듬분석</option>
                <option value="운영체제">운영체제</option>
                <option value="자바프로그래밍언어">자바프로그래밍언어</option>
                <option value="전자회로 1">전자회로 1</option>
                <option value="전자회로 및 통신실습">
                  전자회로 및 통신실습
                </option>
                <option value="직업과 진로설계(전산전자)">
                  직업과 진로설계(전산전자)
                </option>
                <option value="캡스톤디자인1">캡스톤디자인1</option>
                <option value="캡스톤디자인2">캡스톤디자인2</option>
                <option value="컴퓨터 및 전자공학개론">
                  컴퓨터 및 전자공학개론
                </option>
                <option value="컴퓨터그래픽스">컴퓨터그래픽스</option>
                <option value="코딩테스트 서버관리">코딩테스트 서버관리</option>
                <option value="통신이론">통신이론</option>
                <option value="파이썬 프로그래밍">파이썬 프로그래밍</option>
                <option value="프로그래밍 스튜디오">프로그래밍 스튜디오</option>
                <option value="프로그래밍1">프로그래밍1</option>
                <option value="프론트엔드 입문">프론트엔드 입문</option>
                <option value="회로이론">회로이론</option>
              </select>

              <Label>
                월 <RequiredMark>*</RequiredMark>
              </Label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">월 선택하세요.</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`${i + 1}월`}>
                    {i + 1}월
                  </option>
                ))}
              </select>
            </InputRow>
          )}

          {taskType === "basicTask" && (
            <InputRow>
              <Label>
                작업명 <RequiredMark>*</RequiredMark>
              </Label>
              <InputField
                placeholder="예: 2025년 1학기 팀 MT 계획서"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
              <Label>
                작업 요청 설명 <RequiredMark>*</RequiredMark>
              </Label>
              <Textarea
                placeholder="예: 최대한 빠르게 서명을 완료해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              <DatePickerContainer>
                <DateTimePickerTitle>서명 만료 설정</DateTimePickerTitle>
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
              </DatePickerContainer>
            </InputRow>
          )}
          <PasswordInputSection onValid={(pw) => setPassword(pw)} />
          <InputRow>
            <Label>
              문서 선택 <RequiredMark>*</RequiredMark>
            </Label>
            <UploadSection>
              {!document.fileUrl ? (
                <Drop
                  onLoaded={(files) => {
                    const file = files[0];
                    if (file) handlePostFiles(file);
                  }}
                />
              ) : (
                <SelectedFileBox>
                  {previewUrl && (
                    <Document
                      file={previewUrl}
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
            </UploadSection>
          </InputRow>
        </MainArea>
      </StyledBody>
      <ButtonContainer>
        <GrayButton onClick={() => navigate(`/request-document`)}>
          나가기
        </GrayButton>
        <NextButton onClick={handleNextStep}>서명자 추가</NextButton>
      </ButtonContainer>
    </Container>
  );
};
export default SetupTaskPage;

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #e5e5e5;
  position: relative;
  padding-top: 80px;
`;

const StyledBody = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const MainArea = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 600px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const InputField = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  outline: none;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  resize: none;
  overflow: hidden;
`;

const RadioContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const RadioLabel = styled.label`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RadioInput = styled.input`
  cursor: pointer;
`;

// ✅ 날짜 및 시간 선택 관련 스타일 최소화
const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
  padding: 0; /* 패딩 제거 */
  background-color: transparent; /* 배경색 제거 */
  border-radius: 0; /* 테두리 둥글기 제거 */
  border-left: none; /* 왼쪽 테두리 제거 */
`;

const DateTimePickerTitle = styled.h4`
  font-size: 15px;
  font-weight: normal; /* 굵기 기본값 */
  color: inherit; /* 색상 상속 */
  margin: 0 0 5px 0;
`;

// ✅ 만료일 옵션 라디오 버튼 스타일 추가
const ExpirationOptionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f5ff;
  border-radius: 5px;
`;

const ExpirationOptionLabel = styled.label`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #e0e0e0;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const DateTimePickerRow = styled.div`
  display: flex;
  gap: 15px;
`;

const DateTimePickerColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const DatePickerLabel = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const DatePickerInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
`;

const DatePickerHint = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const RequiredNotice = styled.p`
  font-size: 12px;
  color: #ff4d4f;
  text-align: right;
`;

const UploadSection = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SelectedFileBox = styled.div`
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 5px;
  padding: 15px 20px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SelectedFileText = styled.span`
  padding-top: 10px;
  font-weight: bold;
`;

const FileButtonContainer = styled.div`
  margin-top: 10px;
`;

const ChangeFileButton = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonContainer = styled.div`
  display: flex; /* 버튼들을 가로로 배치 */
  justify-content: center; /* 중앙 정렬 */
  align-items: center;
  gap: 10px; /* ✅ 버튼 간 간격 조정 */
  margin: 20px 0;
  padding: 20px;
`;

const GrayButton = styled(ButtonBase)`
  background-color: #ccc;
  color: white;
`;

const NextButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  color: white;
`;
