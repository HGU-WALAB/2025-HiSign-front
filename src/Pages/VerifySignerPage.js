import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApiService from "../utils/ApiService"; // API 호출 모듈

function VerifySignerPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // URL에서 token 추출
  const [isValid, setIsValid] = useState(null); // 토큰 유효성 상태
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 접근입니다.");
      return;
    }

    // 백엔드 API를 호출하여 토큰 유효성 확인
    ApiService.checkSignatureToken(token)
    .then(() => {
      setIsValid(true); // 토큰이 유효하면 이메일 입력 UI 표시
    })
    .catch((err) => {
      setIsValid(false);
      setError(err.message);
    });
  }, [token]);

  return (
    <div>
      <h1>서명 요청</h1>
      {isValid === null && <p>로딩 중...</p>}
      {isValid === false && <p style={{ color: "red" }}>{error}</p>}
      {isValid && <EmailInputForm token={token} />}
    </div>
  );
}

function EmailInputForm({ token }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const handleValidate = () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    ApiService.validateSignatureRequest(token, email)
    .then((response) => {
      console.log(response.data); // 서명할 문서 정보 받아서 처리
    })
    .catch((err) => {
      setError(err.message);
    });
  };

  return (
    <div>
      <p>이메일을 입력하여 서명을 진행하세요.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 입력"
      />
      <button onClick={handleValidate}>인증하기</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default VerifySignerPage;