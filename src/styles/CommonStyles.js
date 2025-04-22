// styles/commonStyles.js
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";

// 공통 입력 행
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

// 공통 레이아웃 영역
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #e5e5e5;
  position: relative;
`;

export const StyledBody = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #e5e5e5;
  padding: 20px;
`;

export const MainArea = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 600px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 20px;
`;

export const GrayButton = styled(ButtonBase)`
  background-color: #ccc;
  color: white;
`;

export const NextButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  color: white;
`;

