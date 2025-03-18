import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import PDFViewer from "../components/SignPage/PDFViewer";
import SignatureOverlay from "../components/SignPage/SignatureOverlay";
import { signingState } from "../recoil/atom/signingState";

const PreviewPage = () => {
  const [signing] = useRecoilState(signingState);
  const navigate = useNavigate();
  
  useEffect(() => {
    // 만약 서명 정보가 없으면 다시 이메일 검증 페이지로 이동
    if (!signing.documentId) {
      alert("유효한 문서 정보가 없습니다. 이메일을 먼저 인증해주세요.");
      navigate("/check-email");
    }
  }, [signing.documentId, navigate]);

  return (
    <MainContainer>
      {/* <Header>
        <Title>문서 미리보기</Title>
      </Header> */}

      {/* 요청 정보 표시 */}
      <InfoSection>
        <InfoItem>
          <Label>작업 요청자:</Label>
          <Value>{signing.requesterName || "알 수 없음"}</Value>
        </InfoItem>
        <InfoItem>
          <Label>작업명:</Label>
          <Value>{signing.requestName || "알 수 없음"}</Value>
        </InfoItem>
        <InfoItem>
          <Label>작업 요청 상세:</Label>
          <Value>{signing.requestName || "알 수 없음"}</Value>
        </InfoItem>
        <InfoItem>
          <Label>문서 이름:</Label>
          <Value>{signing.documentName || "알 수 없음"}</Value>
        </InfoItem>
        <InfoItem>
          <Label>서명자:</Label>
          <Value>{signing.signerName || "알 수 없음"}</Value>
        </InfoItem>
      </InfoSection>

      {/* PDF 문서와 서명 위치 표시 */}
      {signing.fileUrl && signing.signatureFields ? (
        <DocumentContainer>
          <PDFViewer pdfUrl={signing.fileUrl} />
          <SignatureOverlay />
        </DocumentContainer>
      ) : (
        <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
      )}

      {/* 서명 페이지로 이동 버튼 */}
      <ButtonContainer>
        <NextButton onClick={() => navigate("/sign")}>서명하기</NextButton>
      </ButtonContainer>
    </MainContainer>
  );
};

export default PreviewPage;

// 스타일 정의
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const Header = styled.header`
  width: 100%;
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
`;

const InfoSection = styled.div`
  width: 80%;
  max-width: 400px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

const Label = styled.span`
  font-weight: bold;
`;

const Value = styled.span`
  color: #333;
`;

const DocumentContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  position: relative;
  background-color: white;
`;

const LoadingMessage = styled.p`
  color: #666;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
`;

const NextButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: #0056b3;
  }
`;
