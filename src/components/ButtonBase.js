import styled from "styled-components";

// ✅ 반응형 기본 버튼 컴포넌트
const ButtonBase = styled.button`
  padding: ${({ size }) =>
    size === "large" ? "14px 28px" : size === "small" ? "8px 16px" : "12px 24px"};
  font-size: ${({ size }) =>
    size === "large" ? "18px" : size === "small" ? "14px" : "16px"};
  color: ${({ color }) =>
    color === "primary" ? "white" : color === "danger" ? "white" : "black"};
  background-color: ${({ color }) =>
    color === "primary" ? "#007bff" : color === "danger" ? "#dc3545" : "#f8f9fa"};
  border: none;
  border-radius: 25px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${({ disabled }) => (disabled ? "none" : "0 6px 12px rgba(0, 0, 0, 0.3)")};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

/* ✅ 반응형 스타일 적용 */
@media (max-width: 768px) {
    padding: ${({ size }) =>
      size === "large" ? "12px 24px" : size === "small" ? "6px 12px" : "10px 20px"};
    font-size: ${({ size }) =>
      size === "large" ? "16px" : size === "small" ? "12px" : "14px"};
    background-color: ${({ color }) =>
      color === "primary" ? "#0056b3" : color === "danger" ? "#b30000" : "#495057"}; /* ✅ 태블릿 색상 변경 */
  }

  @media (max-width: 480px) {
    padding: ${({ size }) =>
      size === "large" ? "10px 20px" : size === "small" ? "6px 10px" : "8px 16px"};
    font-size: ${({ size }) =>
      size === "large" ? "14px" : size === "small" ? "10px" : "12px"};
    border-radius: 20px;
    background-color: ${({ color }) =>
      color === "primary" ? "#003366" : color === "danger" ? "#660000" : "#343a40"}; /* ✅ 모바일 색상 변경 */
  }
`;

export default ButtonBase;
