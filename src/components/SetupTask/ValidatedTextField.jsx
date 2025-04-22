// components/ValidatedTextField.jsx
import TextField from "@mui/material/TextField";
import React from "react";

const ValidatedTextField = ({ success = false, error = false, helperText = "", ...props }) => {
  const isSuccess = success && !error;

  return (
    <TextField
      {...props}
      error={error}
      helperText={helperText}
      sx={{
        ...props.sx,
        "& input": {
          fontSize: "12px",           // 입력된 텍스트 폰트
        },
        "& .MuiInputBase-input::placeholder": {
          fontSize: "12px",           // placeholder 글꼴
          opacity: 0.7,
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: isSuccess ? "green" : undefined,
          },
          "&:hover fieldset": {
            borderColor: isSuccess ? "green" : undefined,
          },
          "&.Mui-focused fieldset": {
            borderColor: isSuccess ? "green" : undefined,
          },
        },
        "& .MuiFormHelperText-root": {
          fontSize: "10px",
          color: isSuccess ? "green" : error ? "#d32f2f" : undefined,
        },
      }}
    />
  );
};

export default ValidatedTextField;
