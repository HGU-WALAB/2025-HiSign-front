import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const CompleteSignPage = () => {
  const navigate = useNavigate();
  const resetSigningState = useSetRecoilState(signingState);

  useEffect(() => {
    // ✅ 전역 상태 초기화
    resetSigningState({
      documentId: null,
      documentName: "",
      signerEmail: "",
      signerName: "",
      fileUrl: null,
      signatureFields: []
    });
    
    ApiService.deleteSignerCookie()
      .then(() => {
        console.log("서명자 쿠키 삭제 성공");
      })
      .catch((error) => {
        console.error("서명자 쿠키 삭제 실패:", error);
      });
    // ✅ 3초 후 홈으로 이동 (자동 리디렉션)
    // const timer = setTimeout(() => {
    //   navigate("/");
    // }, 3000);

    // return () => clearTimeout(timer); // ✅ 클린업
  }, [navigate, resetSigningState]);

  return (
    <Container>
      <h2>서명이 완료되었습니다! </h2>
      <h2>✅ </h2>
      {/* <p>서명을 요청 받은 모든 서명자가 서명을 마치면 해당 작업이 완료됩니다.</p> */}
    </Container>
  );
};

export default CompleteSignPage;

// ✅ 스타일링
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;
