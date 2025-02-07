import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmailInputModal from "../components/SignPage/EmailInputModal"; // 이메일 입력 모달
import PDFViewer from "../components/SignPage/PDFViewer"; // PDF 렌더링 컴포넌트
import SignatureOverlay from "../components/SignPage/SignatureOverlay"; // 서명 영역 표시 컴포넌트
import ApiService from "../utils/ApiService"; // API 호출 모듈

function SignaturePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isValid, setIsValid] = useState(null); // 토큰 유효성 상태
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [documentId, setDocumentId] = useState(null);
  const [signerName, setSignerName] = useState(null);
  const [signatureFields, setSignatureFields] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  // ✅ 1. 토큰 유효성 검사
  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 접근입니다.");
      return;
    }

    ApiService.checkSignatureToken(token)
      .then(() => {
        setIsValid(true);
        setShowEmailModal(true); // 이메일 입력 모달 표시
      })
      .catch((err) => {
        setIsValid(false);
        setError(err.message);
      });
  }, [token]);

  // ✅ 2. 이메일 인증 후 문서 + 서명 위치 불러오기
  const handleEmailSubmit = (inputEmail) => {
    setEmail(inputEmail);
    setShowEmailModal(false);

    ApiService.validateSignatureRequest(token, inputEmail)
      .then((response) => {
        setDocumentId(response.documentId);
        setSignerName(response.signerName);

        // ✅ PDF 문서 불러오기
        ApiService.fetchDocumentForSigning(response.documentId).then((pdfResponse) => {
          setPdfUrl(URL.createObjectURL(new Blob([pdfResponse.data], { type: "application/pdf" })));
        });

        // ✅ 서명 필드 정보 불러오기
        ApiService.fetchSignatureFields(response.documentId, inputEmail).then((fieldsResponse) => {
          setSignatureFields(fieldsResponse.data);
        });
      })
      .catch((err) => {
        console.error("서명 요청 검증 실패:", err);
        setError(err.message);
      });
  };

  return (
    <div>
      <h1>서명 페이지</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {isValid === null && <p>로딩 중...</p>}

      {isValid && !documentId && showEmailModal && (
        <EmailInputModal onSubmit={handleEmailSubmit} />
      )}

      {documentId && pdfUrl && (
        <div style={{ position: "relative" }}>
          <PDFViewer pdfUrl={pdfUrl} />
          <SignatureOverlay signatureFields={signatureFields} />
        </div>
      )}
    </div>
  );
}

export default SignaturePage;
