import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { signingState } from "../recoil/atom/signingState";

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
      {/* <p>곧 메인 페이지로 이동합니다...</p> */}
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
