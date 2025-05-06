import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import PasswardInputModal from "../components/SignPage/PasswardInputModal";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const CheckPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [signing, setSigning] = useRecoilState(signingState);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(null); // 토큰 자체 유효성
  const [requiresPassword, setRequiresPassword] = useState(null); // 비밀번호 필요 여부
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const member = useRecoilValue(loginMemberState); // 로그인 정보

  useEffect(() => {
    if (!token) {
      setError("❌ 유효하지 않은 접근입니다.");
      return;
    }

    ApiService.checkSignatureToken(token)
      .then((res) => {
        //console.log("서명 요청 검증 결과:", res);
        setIsValid(true);
        setRequiresPassword(res.requiresPassword); // ✅ 비밀번호 필요 여부 저장
        setSigning((prevState) => ({
          ...prevState,
          token: token,
          signerEmail: res.signerEmail,
        }));
        
        // 로그인 사용자의 이메일과 서명자 이메일이 같으면 비밀번호 생략
        //console.log("로그인 사용자 이메일:", member?.email);
        //console.log("서명자 이메일:", res.signerEmail);
        if (member?.email === res.signerEmail) {
          fetchDocumentAndFields(res.signerEmail);
        } else if (res.requiresPassword === false) {
          // ✅ 비밀번호 필요 없으면 바로 문서 가져오기
          fetchDocumentAndFields(res.signerEmail);
        } else {
          setShowPasswordModal(true);
        }
      })
      .catch((err) => {
        setIsValid(false);
        const errorMessage = err.message || "⚠️ 서명 요청 검증에 실패했습니다.";
        setError(errorMessage);
        setShowPasswordModal(true); // ⛔ 닫지 않음
        alert(errorMessage);
      });

    //console.log("전역 변수 signing:", signing);
  }, [token]);

  const fetchDocumentAndFields = (signerEmail) => {
    ApiService.validateSignatureRequest(token, "NONE") // ✅ 비밀번호 없이 validate 호출
      .then((response) => {
        //console.log("서명 요청 검증 결과:", response);

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

        return ApiService.fetchDocumentForSigning(response.documentId)
          .then((pdfResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              fileUrl: URL.createObjectURL(new Blob([pdfResponse.data], { type: "application/pdf" })),
            }));
          })
          .then(() => {
            return ApiService.fetchSignatureFields(response.documentId, signerEmail);
          })
          .then((fieldsResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              signatureFields: fieldsResponse.data,
            }));
            navigate("/preview");
            //console.log("서명 필드 정보:", fieldsResponse.data);
          });
      })
      .catch((err) => {
        console.error("문서/서명 필드 불러오기 실패:", err);
        const errorMessage = err.response?.data?.message || "문서 불러오기에 실패했습니다.";
        setError(errorMessage);
        alert(errorMessage);
      });
  };

  // 비밀번호 입력 후 제출 (모달에서 사용)
  const handlePasswordSubmit = (password, setModalError, triggerShake) => {
    ApiService.validateSignatureRequest(token, password)
      .then((response) => {
        //console.log("서명 요청 검증 결과:", response);

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

        return ApiService.fetchDocumentForSigning(response.documentId)
          .then((pdfResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              fileUrl: URL.createObjectURL(new Blob([pdfResponse.data], { type: "application/pdf" })),
            }));
          })
          .then(() => {
            return ApiService.fetchSignatureFields(response.documentId, signing.signerEmail);
          })
          .then((fieldsResponse) => {
            setSigning((prevState) => ({
              ...prevState,
              signatureFields: fieldsResponse.data,
            }));
            navigate("/preview");
            //console.log("서명 필드 정보:", fieldsResponse.data);
          });
      })
      .catch((err) => {
        console.error("서명 요청 검증 실패:", err);
        const errorMessage = err.response?.data?.message || "비밀번호 인증에 실패했습니다. 다시 시도해주세요.";
        setModalError(errorMessage);
        setShowPasswordModal(true);
        triggerShake(); // 모달 흔들기 효과
      });
  };

  return (
    <MainContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {isValid === null && <LoadingMessage>로딩 중...</LoadingMessage>}
      {isValid && requiresPassword === true && showPasswordModal &&  (
        <PasswardInputModal
          open={true}
          onSubmit={handlePasswordSubmit}
          onClose={() => {}} // 닫기 버튼 비활성화
        />
      )}
    </MainContainer>
  );
};

export default CheckPasswordPage;

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
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
  background-color: #fff3f3;
  border: 1px solid #ff4d4f;
  padding: 10px 15px;
  border-radius: 5px;
  text-align: center;
  margin: 10px auto;
  width: 80%;
  max-width: 500px;
  box-shadow: 0px 2px 8px rgba(255, 77, 79, 0.2);
`;
