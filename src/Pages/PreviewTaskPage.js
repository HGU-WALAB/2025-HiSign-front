// PreviewTaskPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import CompleteModal from "../components/AllocatePage/CompleteModal";
import ButtonBase from "../components/ButtonBase";
import RejectModal from "../components/ListPage/RejectModal";
import PDFViewer from "../components/SignPage/PDFViewer";
import SignaturePopup from "../components/SignPage/SignaturePopup";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const PreviewPage = () => {
  const [signing, setSigning] = useRecoilState(signingState);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!signing.documentId) {
      alert("유효한 문서 정보가 없습니다. 이메일을 먼저 인증해주세요.");
      navigate("/");
    }
  }, [signing.documentId, navigate]);

  const handleReject = () => {
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    ApiService.rejectDocument(signing.documentId, rejectReason, signing.token, signing.signerEmail)
      .then(() => {
        alert("요청이 거절되었습니다.");
        setShowRejectModal(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("요청 거절 중 오류 발생:", error);
        alert("요청 거절에 실패했습니다.");
      });
  };

  const handleSaveSignature = async (imageData) => {
    const updatedFields = signing.signatureFields.map((field) =>
      field.type === 0 ? { ...field, image: imageData } : field
    );
    setSigning((prev) => ({ ...prev, signatureFields: updatedFields }));
    setShowPopup(false);
  };

  const handleSubmitSignature = async () => {
    setLoading(true);
    try {
      const imageField = signing.signatureFields.find((field) => field.type === 0 && field.image);
      let fileName = null;

      if (imageField) {
        const blob = await fetch(imageField.image).then((res) => res.blob());
        fileName = await ApiService.uploadSignatureFile(blob, signing.signerEmail);
      }

      await ApiService.saveSignatures(signing.documentId, {
        email: signing.signerEmail,
        name: signing.signerName,
        signatureFields: signing.signatureFields.map((field) => ({
          signerEmail: signing.signerEmail,
          type: field.type,
          width: field.width,
          height: field.height,
          position: field.position,
          imageName: field.type === 0 ? fileName : null,
          textData: field.textData || null,
        })),
      });

      alert("서명이 완료되었습니다.");
      navigate("/sign-complete");
    } catch (error) {
      alert("서명 처리 중 오류 발생: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAllSigned = signing.signatureFields?.every((field) => field.image || field.textData);

  return (
    <MainContainer>
      <ContentWrapper>
        <Sidebar>
          <InfoSection>
            <InfoItem><Label>작업 요청자:</Label><Value>{signing.requesterName}</Value></InfoItem>
            <InfoItem><Label>작업명:</Label><Value>{signing.requestName}</Value></InfoItem>
            <InfoItem><Label>작업 요청 상세:</Label><Value>{signing.description}</Value></InfoItem>
            <InfoItem><Label>문서 이름:</Label><Value>{signing.documentName}</Value></InfoItem>
            <InfoItem><Label>서명자:</Label><Value>{signing.signerName}</Value></InfoItem>
            <InfoItem><Label>서명 상태:</Label><Value>{signing.isSigned ? "서명 완료" : "서명 대기중"}</Value></InfoItem>
          </InfoSection>

          <ButtonContainer>
            {signing.isRejectable && <RejectButton onClick={handleReject}>거절하기</RejectButton>}
            <NextButton onClick={() => setShowPopup(true)}>
              {isAllSigned ? "다시 서명하기" : "서명하기"}
            </NextButton>
            {isAllSigned && <NextButton onClick={() => setShowCompleteModal(true)}>서명 완료</NextButton>}
          </ButtonContainer>
        </Sidebar>

        <PDFWrapper>
          {signing.fileUrl && signing.signatureFields ? (
            <DocumentContainer>
              <PDFViewer pdfUrl={signing.fileUrl} setCurrentPage={setCurrentPage} />
              {signing.signatureFields
                .filter((field) => field.position.pageNumber === currentPage)
                .map((field, index) => (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      left: field.position.x,
                      top: field.position.y,
                      width: field.width,
                      height: field.height,
                      border: field.image ? "none" : "2px dashed black",
                      backgroundColor: field.image ? "transparent" : "#f8f9fa50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {field.image && (
                      <img
                        src={field.image}
                        alt="서명"
                        style={{ width: "100%", height: "100%", objectFit: "contain", border: "2px solid black" }}
                      />
                    )}
                  </div>
              ))}
            </DocumentContainer>
          ) : (
            <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
          )}
        </PDFWrapper>
      </ContentWrapper>

      {showPopup && (
        <SignaturePopup
          field={signing.signatureFields[0]}
          fieldIndex={0}
          onClose={() => setShowPopup(false)}
          onSave={handleSaveSignature}
          applyToAll={true}
        />
      )}

      <CompleteModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleSubmitSignature}
        loading={loading}
        type="sign"
      />

      <RejectModal
        isVisible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        type="reject"
      />
    </MainContainer>
  );
};

export default PreviewPage;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 80px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
`;

const Sidebar = styled.div`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
`;

const PDFWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
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
  gap: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column-reverse;
`;

const NextButton = styled(ButtonBase)`
  background-color: #03A3FF;
  color: white;
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
