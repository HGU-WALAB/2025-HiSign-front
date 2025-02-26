

import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/entry.webpack";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import Drop from "../components/Drop";
import { documentState } from "../recoil/atom/documentState";
import { memberState } from "../recoil/atom/memberState";
import DatePicker from "react-datepicker"; // 👈 DatePicker import
import "react-datepicker/dist/react-datepicker.css"; // 👈 스타일 추가

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const TaskSetupPage = () => {
  const [document, setDocumentState] = useRecoilState(documentState);
  const member = useRecoilValue(memberState);
  const [requestName, setRequestName] = useState("");
  const [description, setDescription] = useState("");
  const [isRejectable, setIsRejectable] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [deadline, setDeadline] = useState(null); // 👈 마감일 상태 추가
  const navigate = useNavigate();

  const handlePostFiles = (file) => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    setDocumentState((previousDocument) => ({
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
    if (!deadline) {
      alert("마감일을 설정해 주세요."); // 👈 마감일 체크
      return;
    }

    setDocumentState((previousDocument) => ({
      ...previousDocument,
      requestName: requestName,
      description: description,
      isRejectable: isRejectable,
      deadline: deadline, // 👈 마감일 전달
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
            <Label>작업 설정 <RequiredMark>*</RequiredMark> </Label> 
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
            
          </InputRow>

          {/* 마감일자 선택 */}
          <InputRow>
            <Label>
              마감일자 <RequiredMark>*</RequiredMark>
  
            </Label>
            <DatePicker
              selected={deadline}
              onChange={(date) => setDeadline(date)} // 👈 날짜 변경 시 상태 업데이트
              dateFormat="yyyy/MM/dd"
              placeholderText="현재 날짜 이후로만 선택해주세요. "
              minDate={new Date()} // 오늘 날짜부터 선택 가능
            />
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
                  {previewUrl && (
                    <Document
                      file={previewUrl}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                      <Page pageNumber={1} width={250} />
                    </Document>
                  )}
                  <SelectedFileText>{document.fileName}</SelectedFileText>
                  <ButtonContainer>
                    <ChangeFileButton
                      onClick={() =>
                        setDocumentState((previousDocument) => ({
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
        <NextButton onClick={handleNextStep}>서명자 추가</NextButton>
      </FloatingButtonContainer>
    </Container>
  );
};
export default TaskSetupPage;

// 스타일 수정 부분
// 추가 스타일을 작성하겠습니다.


// ✅ 스타일 수정
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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


