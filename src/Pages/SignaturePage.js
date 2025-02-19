import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import EmailInputModal from "../components/SignPage/EmailInputModal";
import PDFViewer from "../components/SignPage/PDFViewer";
import SignatureOverlay from "../components/SignPage/SignatureOverlay";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

function SignaturePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [signing, setSigning] = useRecoilState(signingState);

  // ✅ 1. 토큰 유효성 검사
  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 접근입니다.");
      return;
    }

    ApiService.checkSignatureToken(token)
      .then(() => {
        setIsValid(true);
        setShowEmailModal(true);
      })
      .catch((err) => {
        setIsValid(false);
        const errorMessage = err.response?.data?.message || "서명 요청 검증에 실패했습니다.";
        setError(errorMessage);
        alert(errorMessage);
      });

    console.log("전역 변수 signing:", signing);
  }, [token]);

  // ✅ 2. 이메일 인증 후 문서 + 서명 위치 불러오기
  const handleEmailSubmit = (inputEmail, setModalError) => {
    setSigning((prevState) => ({
      ...prevState,
      signerEmail: inputEmail,
    }));

    ApiService.validateSignatureRequest(token, inputEmail)
      .then((response) => {
        console.log("서명 요청 검증 결과:", response);

        setSigning((prevState) => ({
          ...prevState,
          documentId: response.documentId,
          documentName: response.documentName,
          signerName: response.signerName,
        }));

        // ✅ PDF 문서 불러오기
        return ApiService.fetchDocumentForSigning(response.documentId)
          .then((pdfResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              fileUrl: URL.createObjectURL(new Blob([pdfResponse.data], { type: "application/pdf" })),
            }));
          })
          .then(() => {
            // ✅ 서명 필드 정보 불러오기 (PDF 로딩 후 실행)
            return ApiService.fetchSignatureFields(response.documentId, inputEmail);
          })
          .then((fieldsResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              signatureFields: fieldsResponse.data,
            }));
            setShowEmailModal(false); // 성공시에만 모달 닫기
            console.log("서명 필드 정보:", fieldsResponse.data);
          });
      })
      .catch((err) => {
        console.error("서명 요청 검증 실패:", err);
        const errorMessage = err.response?.data?.message || "이메일 인증에 실패했습니다. 다시 시도해주세요.";
        setModalError(errorMessage); // 모달 내부 에러 메시지 설정
        alert(errorMessage);
        // 실패시 모달을 닫지 않음
      });
  };

  const handleSubmitSignature = async () => {
    if (!signing.documentId || signing.signatureFields.length === 0) {
      alert("서명할 필드가 없습니다.");
      return;
    }
    console.log("서명 저장 상태:", signing);
    const signerData = {
      email: signing.signerEmail,
      name: signing.signerName,
      signatureFields: signing.signatureFields.map(field => ({
        signerEmail: signing.signerEmail,
        type: field.type,
        width: field.width,
        height: field.height,
        position: field.position,
        imageName: field.imageName || null,
        textData: field.textData || null
      }))
    };
    console.log("서명 데이터:", signerData);
    try {
      const response = await ApiService.saveSignatures(signing.documentId, signerData);
      alert("서명이 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("서명 저장 실패:", error);
      alert("서명 저장 중 오류 발생");
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isValid === null && <p>로딩 중...</p>}

      {/* ✅ 이메일 모달 - isValid가 true이고 documentId가 없을 때 표시 */}
      {isValid && !signing.documentId && (
        <EmailInputModal 
          open={true} 
          onSubmit={handleEmailSubmit} 
          onClose={() => {}} // 닫기 버튼 비활성화
        />
      )}

      {/* ✅ PDF 및 서명 영역 표시 */}
      {signing.documentId && signing.fileUrl && (
        <DocumentContainer>
          <PDFViewer pdfUrl={signing.fileUrl} />
          <SignatureOverlay signatureFields={signing.signatureFields} />
          
        </DocumentContainer>
      )}

      {signing.documentId && signing.fileUrl && (
        <ButtonContainer>
          <CompleteButton onClick={handleSubmitSignature}> 완료 </CompleteButton> 
        </ButtonContainer>
      )}
    </div>
  );
}

export default SignaturePage;

const DocumentContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  position: relative;
  background-color: white;
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
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

const CompleteButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
`;