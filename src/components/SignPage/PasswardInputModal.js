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
      setError("비밀번호를 입력해주세요.");
      triggerShake();
      return;
    }

    onSubmit(password, setError, triggerShake);
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
          width: { xs: "90%", sm: 400, md: 500 },
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

          <Typography variant="body1" sx={{ mb: 2 }}>
            이메일에 첨부된 <strong>비밀번호</strong>를 입력하여 주세요.
          </Typography>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: window.innerWidth < 480 ? "column" : "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="비밀번호 입력"
              style={{
                width: "100%",
                maxWidth: "300px",
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
                minWidth: "80px",
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
