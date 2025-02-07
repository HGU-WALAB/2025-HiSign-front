import { useState } from "react";

function EmailInputModal({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const handleValidate = () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    onSubmit(email);
  };

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "white",
      padding: "20px",
      boxShadow: "0px 0px 10px rgba(0,0,0,0.3)"
    }}>
      <h3>이메일 인증</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 입력"
      />
      <button onClick={handleValidate}>확인</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default EmailInputModal;
