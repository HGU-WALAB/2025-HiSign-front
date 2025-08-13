// PreviewTaskPage.js
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import ConfirmModal from "../components/ConfirmModal";
import RejectModal from "../components/ListPage/RejectModal";
import PDFViewer from "../components/SignPage/PDFViewer";
import SignaturePopup from "../components/SignPage/SignaturePopup";
import { loginMemberState } from "../recoil/atom/loginMemberState";
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
  const [pdfScale, setPdfScale] = useState(1);

  // ✅ 저장 동의 + 완료된 이미지 서명이 실제로 존재하는지 (백엔드 검사결과)
  const [canLoadSavedSignature, setCanLoadSavedSignature] = useState(false);

  const loginMember = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!signing.documentId) {
      alert("유효한 문서 정보가 없습니다. 다시 진행해 주세요");
      navigate("/");
      return;
    }
  }, [signing.documentId, navigate]);

  // ✅ 백엔드의 existsSavedSignature 결과로 버튼 노출 판단
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!signing?.signerEmail) {
        setCanLoadSavedSignature(false);
        return;
      }
      try {
        const exists = await ApiService.checkExistingSignature(signing.signerEmail);
        if (mounted) setCanLoadSavedSignature(Boolean(exists));
      } catch {
        if (mounted) setCanLoadSavedSignature(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [signing?.signerEmail]);

  const handleReject = () => {
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await ApiService.rejectDocument(
          signing.documentId,
          rejectReason,
          signing.token,
          signing.signerEmail,
          signing.signerName
      );

      alert("요청이 거절되었습니다.");
      setShowRejectModal(false);
      navigate("/");
    } catch (error) {
      console.error("요청 거절 중 오류 발생:", error);
      alert("요청 거절에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSignature = async (imageData, saveConsent) => {
    const updatedFields = signing.signatureFields.map((field) =>
        field.type === 0 ? { ...field, image: imageData } : field
    );

    setSigning((prev) => ({
      ...prev,
      signatureFields: updatedFields,
      // 백엔드가 boolean을 받아도 되고, 숫자 0/1이어도 됩니다. 필요 시 아래 라인에서 정규화:
      // saveConsent: saveConsent ? 1 : 0,
      saveConsent,
    }));

    setShowPopup(false);
  };

  const handleLoadExistingSignature = async () => {
    try {
      const ok = await ApiService.checkExistingSignature(signing.signerEmail);
      if (!ok) {
        alert("저장 동의된 이전 서명이 없어서 불러올 수 없습니다.");
        return;
      }
    } catch {
      alert("기존 서명 확인에 실패했습니다.");
      return;
    }

    try {
      const imageUrl = await ApiService.getLatestImageSignature(signing.signerEmail);

      const updatedFields = signing.signatureFields.map((field) =>
          field.type === 0 ? { ...field, image: imageUrl } : field
      );

      setSigning((prev) => ({
        ...prev,
        signatureFields: updatedFields,
      }));

      alert("이전 서명이 불러와졌습니다.");
    } catch (error) {
      alert("기존 서명을 불러오는 데 실패했습니다.");
      console.error(error);
    }
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
          saveConsent: signing.saveConsent ?? false,
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

  const isAllSigned = useMemo(() => {
    return signing.signatureFields?.every((field) => field.image || field.textData);
  }, [signing.signatureFields]);

  return (
      <MainContainer>
        <ContentWrapper>
          <Sidebar>
            <Link
                to={loginMember.uniqueId ? "/dashboard" : "/"}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                }}
            >
              <img
                  src={`${process.env.PUBLIC_URL}/hisignlogo_resized.png`}
                  alt="HI-Sign 로고"
                  style={{ height: 120, maxWidth: "100%" }}
              />
            </Link>

            <InfoSection>
              <InfoItem>
                <Label>작업 요청자:</Label><Value>{signing.requesterName}</Value>
              </InfoItem>
              <InfoItem>
                <Label>작업명:</Label><Value>{signing.requestName}</Value>
              </InfoItem>
              <InfoItem>
                <Label>작업 요청 상세:</Label><Value>{signing.description}</Value>
              </InfoItem>
              <InfoItem>
                <Label>문서 이름:</Label><Value>{signing.documentName}</Value>
              </InfoItem>
              <InfoItem>
                <Label>서명자:</Label><Value>{signing.signerName}</Value>
              </InfoItem>
              <InfoItem>
                <Label>서명 상태:</Label><Value>{signing.isSigned ? "서명 완료" : "서명 대기중"}</Value>
              </InfoItem>
            </InfoSection>

            <ButtonContainer>
              {signing.isRejectable && (
                  <RejectButton onClick={handleReject}>거절하기</RejectButton>
              )}

              {isAllSigned ? (
                  <OutlinedButton onClick={() => setShowPopup(true)}>다시 서명하기</OutlinedButton>
              ) : (
                  <NextButton onClick={() => setShowPopup(true)}>서명하기</NextButton>
              )}

              {isAllSigned && (
                  <NextButton onClick={() => setShowCompleteModal(true)}>서명 완료</NextButton>
              )}

              {canLoadSavedSignature && (
                  <OutlinedButton onClick={handleLoadExistingSignature}>
                    기존 서명 불러오기
                  </OutlinedButton>
              )}
            </ButtonContainer>
          </Sidebar>

          <PDFWrapper>
            {signing.fileUrl && signing.signatureFields ? (
                <DocumentContainer>
                  <PDFViewer
                      pdfUrl={signing.fileUrl}
                      setCurrentPage={setCurrentPage}
                      onScaleChange={setPdfScale}
                      type="sign"
                  />
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

        <ConfirmModal
            open={showCompleteModal}
            loading={loading}
            onClose={() => setShowCompleteModal(false)}
            onConfirm={handleSubmitSignature}
            title="서명 완료"
            message="서명을 완료하시겠습니까?"
            warningText="*완료 후에는 취소하실 수 없습니다."
        />

        <RejectModal
            isVisible={showRejectModal}
            loading={loading}
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

// ===================== Styled Components =====================

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 0;
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
  max-width: 70vw;
  background-color: #f5f5f5;
  position: relative;
  width: 100%;
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

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 10px;
  }
`;

const NextButton = styled(ButtonBase)`
  background-color: #03a3ff;
  color: white;

  &:hover {
    background-color: rgba(3, 163, 255, 0.66);
  }

  @media (max-width: 768px) {
    width: 40%;
  }
`;

const OutlinedButton = styled(ButtonBase)`
  background-color: transparent;
  color: #03a3ff;
  border: 2px solid #03a3ff;

  &:hover {
    background-color: rgba(3, 163, 255, 0.05);
  }
`;

const RejectButton = styled(ButtonBase)`
  background-color: rgb(255, 0, 0);
  color: white;

  &:hover {
    background-color: rgb(200, 0, 0);
  }

  @media (max-width: 768px) {
    width: 40%;
  }
`;
