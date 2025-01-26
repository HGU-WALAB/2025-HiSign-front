import React from 'react';
import styled from 'styled-components';
import ApiService from '../utils/ApiService';

// 스타일이 적용된 버튼 컴포넌트
const StyledButton = styled.button`
  background-color: #0077cc;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  outline: none;

  &:hover {
    background-color: #005fa3;
  }

  &:active {
    background-color: #004080;
  }
`;

const HisnetLoginButton = () => {
  return (
    <StyledButton
      onClick={() => ApiService.loginWithHisnet()}
    >
      히즈넷으로 로그인
    </StyledButton>
  );
};

export default HisnetLoginButton;
