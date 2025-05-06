import { Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";
import "../../styles/animations.css";

function PasswordInputModal({ open, onSubmit, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleValidate = () => {
    if (!password) {
      setError("비밀번호를를 입력해주세요."); // 이메일이 비어있을 경우 에러 메시지 출력
      triggerShake(); // 애니메이션 트리거
      return;
    }

    onSubmit(password, setError, triggerShake); // onSubmit에 에러 상태 업데이트를 넘김
  };

  return (
    <Modal
      open={open}
      onClose={() => {}}
      slots={{ backdrop: "div" }}
      slotProps={{
        backdrop: {
          onClick: (e) => e.stopPropagation(),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={shake ? "shake-horizontal" : ""}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          비밀번호 인증
        </Typography>

        {/* 안내문 추가 */}
        <Typography
          variant="body1"
          sx={{ mb: 2 }}
        >
          이메일에 첨부된 <strong>비밀번호</strong>를 입력하여 주세요.
        </Typography>

          <br>
          </br>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: "10px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null); // 입력이 바뀌면 에러 초기화
            }}
            placeholder="비밀번호 입력"
            style={{
              width: "50%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <Button
            onClick={handleValidate}
            sx={{
              backgroundColor: "#007BFF",
              color: "white",
              "&:hover": { backgroundColor: "#0056b3" },
            }}
          >
            확인
          </Button>
        </div>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </Box>
    </Modal>
  );
}

export default PasswordInputModal;
