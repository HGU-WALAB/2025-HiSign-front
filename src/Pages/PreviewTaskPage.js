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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // 만약 서명 정보가 없으면 다시 이메일 검증 페이지로 이동
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
      </InfoSection>

      {/* PDF 문서와 서명 위치 표시 */}
      {signing.fileUrl && signing.signatureFields ? (
        <DocumentContainer>
          <PDFViewer
            pdfUrl={signing.fileUrl}
            setCurrentPage={setCurrentPage}
          />
          <SignatureMarker currentPage={currentPage} />
        </DocumentContainer>
      ) : (
        <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
      )}

      {/* 서명 페이지로 이동 버튼 */}
      <ButtonContainer>
        {signing.isRejectable && (<RejectButton onClick={handleReject}>거절하기</RejectButton>)}
        <NextButton onClick={() => navigate("/sign")}>서명하기</NextButton>
      </ButtonContainer>

      <RejectModal isVisible={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirmReject} rejectReason={rejectReason} setRejectReason={setRejectReason} />
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
  padding: 80px 0 20px 0;
  background-color:#f5f5f5;
`;

const InfoSection = styled.div`
  width: 80%;
  max-width: 400px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0 20px 0;
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
  background-color: #f5f5f5;
`;

const LoadingMessage = styled.p`
  color: #666;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
`;

const NextButton = styled(ButtonBase)`
  background-color: #03A3FF;
  color: white;
  
  &:hover {
    background-color:rgba(3, 163, 255, 0.66);
  }
`;

const RejectButton = styled(ButtonBase)`
  background-color: rgb(255, 0, 0);
  color: white;
  margin-right: 10px;
  &:hover {
    background-color: rgb(179, 0, 0);
  }
`;