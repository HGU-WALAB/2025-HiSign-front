// styles/sharedStyles.js
import styled from "styled-components";

// 공통 입력행
export const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
`;

// 공통 라벨
export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

// 필수 표시
export const RequiredMark = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
`;

// 비밀번호 입력 박스 정렬
export const PasswordRow = styled.div`
  display: flex;
  gap: 10px;
`;

export const PasswordRequiredNotice = styled.p`
  font-size: 12px;
  color: #ff4d4f;
  text-align: start;
  margin: 0px;
  padding: 0px;
`;