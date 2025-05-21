import { useEffect, useState } from "react";
import { InputRow, Label } from "../../styles/CommonStyles";
import { PasswordRequiredNotice, PasswordRow, RequiredMark } from "../../styles/SetupTaskStyle";
import ValidatedTextField from "./ValidatedTextField";

const PasswordInputSection = ({ onValid }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);

  useEffect(() => {
    if (password.length === 5 && passwordConfirm.length === 5) {
      const match = password === passwordConfirm;
      setPasswordMatch(match);
      onValid(password, match);
    } else {
      setPasswordMatch(null);
      onValid(password, false);
    }
  }, [password, passwordConfirm]);

  const handlePasswordChange = (value) => {
    if (/^\d{0,5}$/.test(value)) {
      setPassword(value);
      setPasswordError(value.length !== 5 ? "숫자 5자리를 입력해주세요." : "");
    }
  };

  const handlePasswordConfirmChange = (value) => {
    if (/^\d{0,5}$/.test(value)) {
      setPasswordConfirm(value);
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
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={!!passwordError || passwordMatch === false}
          success={passwordMatch === true}
          helperText={passwordError || ""}
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