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
        setError(err.message);
      });
      
    console.log("전역 변수 signing:", signing);
  }, [token,signing]);

  // ✅ 2. 이메일 인증 후 문서 + 서명 위치 불러오기
  const handleEmailSubmit = (inputEmail, setError) => {
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
            console.log("서명 필드 정보:", fieldsResponse.data);
          });
      })
      .catch((err) => {
        console.error("서명 요청 검증 실패:", err);
        setError("이메일 인증에 실패했습니다. 다시 시도해주세요."); // 모달 내부에서 에러 표시
      });
  
    setShowEmailModal(false);
  };
  

  return (
    <div>
      <h1>서명 페이지</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isValid === null && <p>로딩 중...</p>}

      {/* ✅ 이메일 모달 */}
      {isValid && !signing.documentId && showEmailModal && (
        <EmailInputModal open={showEmailModal} onSubmit={handleEmailSubmit} onClose={() => setShowEmailModal(false)} />
      )}

      {/* ✅ PDF 및 서명 영역 표시 */}
      {signing.documentId && signing.fileUrl && (
        <DocumentContainer>
          <PDFViewer pdfUrl={signing.fileUrl} />
          <SignatureOverlay signatureFields={signing.signatureFields} />
        </DocumentContainer>
      )}
    </div>
  );
}

export default SignaturePage;

const DocumentContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #999;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;