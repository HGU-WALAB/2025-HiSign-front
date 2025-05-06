// PreviewPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import RejectModal from "../components/ListPage/RejectModal";
import SignatureMarker from "../components/PreviewPage/SignatureMarker";
import PDFViewer from "../components/SignPage/PDFViewer";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const PreviewPage = () => {
  const [signing] = useRecoilState(signingState);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("서명 요청 정보:", signing);
    if (!signing.documentId) {
      alert("유효한 문서 정보가 없습니다. 이메일을 먼저 인증해주세요.");
      navigate("/");
    }
  }, [signing.documentId, navigate]);

  const handleReject = () => {
    setRejectReason("");
    setShowModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    ApiService.rejectDocument(signing.documentId, rejectReason, signing.token, signing.signerEmail)
      .then(() => {
        alert("요청이 거절되었습니다.");
        setShowModal(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("요청 거절 중 오류 발생:", error);
        alert("요청 거절에 실패했습니다.");
      });
  };

  return (
    <MainContainer>
      <ContentWrapper>
        <Sidebar>
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
              <Value>{signing.description || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>문서 이름:</Label>
              <Value>{signing.documentName || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>서명자:</Label>
              <Value>{signing.signerName || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>서명 상태:</Label>
              <Value>{signing.isSigned ? "서명 완료" : "서명 대기중"}</Value>
            </InfoItem>
          </InfoSection>

          <ButtonContainer>
            {signing.isRejectable && <RejectButton onClick={handleReject}>거절하기</RejectButton>}
            <NextButton onClick={() => navigate("/sign")}>서명하기</NextButton>
          </ButtonContainer>
        </Sidebar>

        <PDFWrapper>
          {signing.fileUrl && signing.signatureFields ? (
            <DocumentContainer>
              <PDFViewer pdfUrl={signing.fileUrl} setCurrentPage={setCurrentPage} />
              <SignatureMarker currentPage={currentPage} />
            </DocumentContainer>
          ) : (
            <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
          )}
        </PDFWrapper>
      </ContentWrapper>

      <RejectModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />
    </MainContainer>
  );
};

export default PreviewPage;

// Styled Components

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 0; /* 상단 마진 제거 */
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

const PDFWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const InfoSection = styled.div`
  width: 100%;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
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
  background-color: #f5f5f5;
  position: relative;
`;

const LoadingMessage = styled.p`
  color: #666;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const NextButton = styled(ButtonBase)`
  background-color: #03a3ff;
  color: white;
  margin-left: 10px;

  &:hover {
    background-color: rgba(3, 163, 255, 0.66);
  }
`;

const RejectButton = styled(ButtonBase)`
  background-color: rgb(255, 0, 0);
  color: white;

  &:hover {
    background-color: rgb(179, 0, 0);
  }
`;
