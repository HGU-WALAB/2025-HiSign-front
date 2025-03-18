import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import EmailInputModal from "../components/SignPage/EmailInputModal";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const CheckEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(null);
  const token = searchParams.get("token");
  const [error, setError] = useState(null);
  const [signing, setSigning] = useRecoilState(signingState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("❌ 유효하지 않은 접근입니다.");
      return;
    }
  
    ApiService.checkSignatureToken(token)
      .then(() => {
        setIsValid(true);
        setSigning((prevState) => ({
          ...prevState,
          token: token,
        }));
      })
      .catch((err) => {
        setIsValid(false);
        const errorMessage = err.message || "⚠️ 서명 요청 검증에 실패했습니다.";
        setError(errorMessage);
        alert(errorMessage); // ✅ 사용자에게 알림
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
          requesterName: response.requesterName,
          requestName: response.requestName,
          description: response.description,
          isRejectable: response.isRejectable === 1,
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
            navigate("/preview");
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

  return (
    <MainContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {isValid === null && <LoadingMessage>로딩 중...</LoadingMessage>}
      {isValid && !signing.documentId && (
        <EmailInputModal
          open={true}
          onSubmit={handleEmailSubmit}
          onClose={() => {}} // 닫기 버튼 비활성화
        />
      )}
    </MainContainer>
  );
}
export default CheckEmailPage;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 80px;
  background-color: #f5f5f5;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.p`
  color: #ff4d4f; /* 빨간색 (경고 색상) */
  font-size: 16px; /* 글씨 크기 */
  font-weight: bold; /* 굵은 글씨 */
  background-color: #fff3f3; /* 연한 빨간색 배경 */
  border: 1px solid #ff4d4f; /* 빨간색 테두리 */
  padding: 10px 15px; /* 안쪽 여백 */
  border-radius: 5px; /* 모서리 둥글게 */
  text-align: center; /* 중앙 정렬 */
  margin: 10px auto; /* 위아래 여백 */
  width: 80%; /* 가로 크기 */
  max-width: 500px; /* 최대 크기 */
  box-shadow: 0px 2px 8px rgba(255, 77, 79, 0.2); /* 연한 그림자 */
`;