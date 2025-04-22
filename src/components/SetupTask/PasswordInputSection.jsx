import React, { useState } from "react";
import { InputRow, Label, PasswordRequiredNotice, PasswordRow, RequiredMark } from "../../styles/SetupTaskStyle";
import ValidatedTextField from "./ValidatedTextField";


const PasswordInputSection = ({ onValid }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);

  const handlePasswordChange = (value) => {
    if (/^\d{0,5}$/.test(value)) {
      setPassword(value);
      setPasswordError(value.length !== 5 ? "숫자 5자리를 입력해주세요." : "");
  
      if (value.length === 5 && passwordConfirm.length === 5) {
        const match = value === passwordConfirm;
        setPasswordMatch(match);
        onValid(value, match); // ✅ 일치 여부 전달
      } else {
        setPasswordMatch(null);
        onValid(value, false);
      }
    }
  };
  
  const handlePasswordConfirmChange = (value) => {
    if (/^\d{0,5}$/.test(value)) {
      setPasswordConfirm(value);

      const match = password === value;
      const shouldCompare = password.length > 0 || value.length > 0;

      if (shouldCompare) {
        setPasswordMatch(match);
        onValid(password, match); // 실시간 전달
      } else {
        setPasswordMatch(null); // 둘 다 비어있을 경우
        onValid(password, false);
      }
    }
  };
  
  return (
    <InputRow>
      <Label>
        인증 비밀번호 설정 <RequiredMark>*</RequiredMark>
      </Label>
      <PasswordRow>
        <ValidatedTextField
          type="password"
          placeholder="비밀번호 (숫자 5자리)"
          value={password}
          onChange={(e) => {
            handlePasswordChange(e.target.value);
            handlePasswordConfirmChange(passwordConfirm);
          }}
          error={!!passwordError || passwordMatch === false}
          success={passwordMatch === true}
          helperText={
            passwordError ? passwordError : ""
          }
          size="small"
          sx={{ flex: 1, mr: 1 }}
        />
        <ValidatedTextField
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => handlePasswordConfirmChange(e.target.value)}
          error={passwordMatch === false}
          success={passwordMatch === true}
          helperText={
            passwordMatch === false
              ? "비밀번호가 일치하지 않습니다"
              : passwordMatch === true
              ? "비밀번호가 일치합니다"
              : ""
          }
          size="small"
          sx={{ flex: 1 }}
        />
      </PasswordRow>
      <PasswordRequiredNotice>! 비밀번호는 5자리 숫자여야 합니다.</PasswordRequiredNotice>
      <PasswordRequiredNotice>! 비밀번호는 서명자가 문서에 접근하기 위한 인증 비밀번호입니다.</PasswordRequiredNotice>
    </InputRow>
  );
};

export default PasswordInputSection;