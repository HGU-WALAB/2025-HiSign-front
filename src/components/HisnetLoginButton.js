import React from 'react';
import styled from 'styled-components';

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
  // 로그인 API로 리디렉션하는 함수
  const handleCardClickHisnet = (returnUrl, accessKey) => {
    const url = `https://walab.info:8443/HisnetLogin/hisnet-login?returnUrl=${encodeURIComponent(returnUrl)}&accessKey=${encodeURIComponent(accessKey)}`;
    window.location.href = url;
  };

  return (
    <StyledButton 
      onClick={() => handleCardClickHisnet('http://localhost:3000/login-ing', 'a0QGSkE5zFwJqIJncS9y')}
    >
      히즈넷으로 로그인
    </StyledButton>
  );
};

export default HisnetLoginButton;
