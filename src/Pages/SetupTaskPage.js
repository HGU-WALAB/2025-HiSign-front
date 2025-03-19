import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/entry.webpack";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import Drop from "../components/Drop";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { taskState } from "../recoil/atom/taskState";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const SetupTaskPage = () => {
  const [document, setTaskState] = useRecoilState(taskState);
  const member = useRecoilValue(loginMemberState);
  const [requestName, setRequestName] = useState("");
  const [description, setDescription] = useState("");
  const [isRejectable, setIsRejectable] = useState(0); // ✅ 기본값: 거절 불가능 (0)
  const [expirationDate, setExpirationDate] = useState(""); // ✅ 서명 만료 날짜 상태
  const [expirationTime, setExpirationTime] = useState("23:59"); // ✅ 서명 만료 시간 상태 추가
  const [previewUrl, setPreviewUrl] = useState(null); // ✅ 파일 미리보기 상태 추가
  const [numPages, setNumPages] = useState(null);
  // ✅ 만료일 선택 옵션 상태 추가
  const [expirationOption, setExpirationOption] = useState("custom");
  const navigate = useNavigate();

  // ✅ 오늘 날짜를 기본 최소값으로 설정
  const today = new Date().toISOString().split('T')[0];

  // ✅ 만료일 옵션 계산 함수
  const calculateExpirationDate = (option) => {
    const now = new Date();
    
    switch(option) {
      case "today":
        return now.toISOString().split('T')[0];
      case "threeDays":
        now.setDate(now.getDate() + 3);
        return now.toISOString().split('T')[0];
      case "oneWeek":
        now.setDate(now.getDate() + 7);
        return now.toISOString().split('T')[0];
      default:
        return expirationDate;
    }
  };

  // ✅ 만료일 옵션 변경 핸들러
  const handleExpirationOptionChange = (option) => {
    setExpirationOption(option);
    const newDate = calculateExpirationDate(option);
    setExpirationDate(newDate);
  };

  const handlePostFiles = (file) => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }
  
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl); // ✅ PDF URL 저장
  
    setTaskState((previousDocument) => ({
      ...previousDocument,
      ownerId: member.unique_id,
      fileName: file.name,
      fileUrl: blobUrl,
    }));
  };

  const handleNextStep = () => {
    if (!requestName.trim()) {
      alert("요청명을 입력해 주세요.");
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
    
    // ✅ 거절 가능한 경우 만료일 검증 추가
    if (isRejectable === 1) {
      if (!expirationDate) {
        alert("서명 만료일을 선택해 주세요.");
        return;
      }
      if (!expirationTime) {
        alert("서명 만료 시간을 선택해 주세요.");
        return;
      }
    }

    // ✅ 날짜와 시간을 합쳐서 저장
    const formattedExpiration = isRejectable === 1 
      ? `${expirationDate}T${expirationTime}:00` // ISO 형식으로 변환 (YYYY-MM-DDTHH:MM:00)
      : null;

    setTaskState((previousDocument) => ({
      ...previousDocument,
      requestName: requestName,
      description: description,
      isRejectable: isRejectable,
      expirationDateTime: formattedExpiration, // ✅ 날짜와 시간이 합쳐진 값으로 저장
    }));

    navigate(`/request`);
  };

  useEffect(() => {
    console.log(document);
  }, [document]);

  return (
      <Container style={{paddingTop: "2.5rem"}}>
        <StyledBody>
          <MainArea>
            <Title>작업 정보 입력</Title>

            {/* 요청 이름 입력 */}
            <InputRow>
              <RequiredNotice>* 항목은 필수 입력란입니다.</RequiredNotice>
              <Label>
                작업명 <RequiredMark>*</RequiredMark>
              </Label>
              <InputField
                  placeholder="예: 2024년 1분기 계약서 서명 요청"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
              />
            </InputRow>

            {/* 문서 설명 입력 */}
            <InputRow>
              <Label>
                작업 요청 설명 <RequiredMark>*</RequiredMark>
              </Label>
              <Textarea
                  placeholder="예: 최대한 빠르게 서명을 완료해주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
              />
            </InputRow>

            {/* 작업 설정 (라디오 버튼) */}
            <InputRow>
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
              
              {/* ✅ 만료일 및 시간 선택 */}
              <DatePickerContainer>
                <DateTimePickerTitle>서명 만료 설정</DateTimePickerTitle>
                
                {/* ✅ 만료일 옵션 라디오 버튼 추가 */}
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
                  <ExpirationOptionLabel>
                    <RadioInput
                      type="radio"
                      name="expirationOption"
                      value="custom"
                      checked={expirationOption === "custom"}
                      onChange={() => setExpirationOption("custom")}
                    />
                    직접 선택
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
                  서명 요청이 만료되는 날짜와 시간을 선택하세요. 만료 시점 이후에는 서명이 불가합니다.
                </DatePickerHint>
              </DatePickerContainer>
            </InputRow>
            
            {/* 문서 선택 (파일 업로드) */}
            <InputRow>
              <Label>
                문서 선택 <RequiredMark>*</RequiredMark>
              </Label>
              <UploadSection>
                {!document.fileUrl ? (
                    <Drop
                        onLoaded={(files) => {
                          const file = files[0];
                          if (file) {
                            handlePostFiles(file);
                          }
                        }}
                    />
                ) : (
                    <SelectedFileBox>
                      {/* ✅ PDF 미리보기 추가 */}
                      {previewUrl && (
                          <Document
                              file={previewUrl}
                              onLoadSuccess={({numPages}) => setNumPages(numPages)}
                          >
                            <Page pageNumber={1} width={250}/> {/* 첫 페이지 미리보기 */}
                          </Document>
                      )}
                      <SelectedFileText>{document.fileName}</SelectedFileText>
                      <ButtonContainer>
                        <ChangeFileButton
                            onClick={() =>
                                setTaskState((previousDocument) => ({
                                  ...previousDocument,
                                  fileName: "",
                                  fileUrl: null,
                                }))
                            }
                        >
                          다른 문서 선택
                        </ChangeFileButton>
                      </ButtonContainer>
                    </SelectedFileBox>
                )}
              </UploadSection>
            </InputRow>
          </MainArea>
        </StyledBody>

        {/* 하단 이동 버튼 */}
        <FloatingButtonContainer>
          <GrayButton onClick={() => navigate(`/request-document`)}>나가기</GrayButton>
          <NextButton onClick={handleNextStep}>
            서명자 추가
          </NextButton>
        </FloatingButtonContainer>
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

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
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

// ✅ 날짜 및 시간 선택 관련 스타일 추가/수정
const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f8ff;
  border-radius: 5px;
  border-left: 3px solid #007bff;
`;

const DateTimePickerTitle = styled.h4`
  font-size: 15px;
  font-weight: bold;
  color: #007bff;
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

const ButtonContainer = styled.div`
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

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 1000;
`;

const GrayButton = styled.button`
  background-color: #ccc;
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
`;

const NextButton = styled.button`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
`;

const FileInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;