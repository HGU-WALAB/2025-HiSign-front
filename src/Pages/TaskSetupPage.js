import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import Drop from "../components/Drop";
import { documentState } from "../recoil/atom/documentState";
import { memberState } from "../recoil/atom/memberState";

const TaskSetupPage = () => {
  const [document, setDocumentState] = useRecoilState(documentState);
  const member = useRecoilValue(memberState);
  const [requestName, setRequestName] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();

  const handlePostFiles = (file) => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);

    setDocumentState((previousDocument) => ({
      ...previousDocument,
      ownerId: member.unique_id,
      fileName: file.name,
      fileUrl: blobUrl,
    }));
  };

  const handleRequestNameConfirm = () => {
    if (!isConfirmed) {
      if (!requestName.trim()) {
        alert("요청명을 입력해 주세요.");
        return;
      }
    }

    setDocumentState((previousDocument) => ({
      ...previousDocument,
      requestName: requestName,
    }));
    setIsConfirmed(!isConfirmed);
  };

  useEffect(() => {
    console.log(document); 
  }, [document]);

  return (
    <Container>
      <StyledBody>
        <MainArea>
          <Title>{isConfirmed ? "문서 선택" : "요청 이름 지정"}</Title>

          {/* 요청 이름 입력 */}
          <InputRow>
            <Input
              placeholder="요청 이름 입력"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              disabled={isConfirmed}
            />
            <ConfirmButton isConfirmed={isConfirmed} onClick={handleRequestNameConfirm}>
              {isConfirmed ? "수정" : "완료"}
            </ConfirmButton>
          </InputRow>

          {/* 요청명이 확정된 경우 파일 선택 UI 표시 */}
          {isConfirmed && (
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
                  <SelectedFileText>{document.fileName} 문서가 선택되었습니다.</SelectedFileText>
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
          )}
        </MainArea>
      </StyledBody>

      {/* 하단 이동 버튼 */}
      <FloatingButtonContainer>
        <GrayButton onClick={() => navigate(`/request-document`)}>나가기</GrayButton>
        <NextButton onClick={() => (navigate(`/request`))} disabled={!document.fileUrl}>
          서명자 추가
        </NextButton>
      </FloatingButtonContainer>
    </Container>
  );
};
export default TaskSetupPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: 100%;
  font-size: 14px;
`;

const ConfirmButton = styled.button`
  width: 80px;
  padding: 10px 20px;
  background-color: ${({ isConfirmed }) => (isConfirmed ? "#6c757d" : "#007bff")};
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ isConfirmed }) => (isConfirmed ? "#5a6268" : "#0056b3")};
  }
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

const ButtonBase = styled.button`
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
`;

const GrayButton = styled(ButtonBase)`
  background-color: #ccc;
`;

const NextButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
`;
