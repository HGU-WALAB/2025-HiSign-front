import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import landingpic from "../asset/landingpic.png"; // 이미지 import
import HisnetLoginButton from "../components/HisnetLoginButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";

function SideBar() {
  const loginMember = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginMember.uniqueId) {
      // 로그인된 상태라면 대시보드로 이동
      navigate("/dashboard");
    }
  }, [loginMember]);

  return (
    <PageContainer>
      <LeftPane>
        <Logo>HiSign</Logo>
        <Title>
          쉽고 빠르게
          <br />안전한 전자서명 솔루션
        </Title>
        {loginMember.uniqueId ? (
          <ActionButton to="/tasksetup">서명 요청</ActionButton>
        ) : (
          <HisnetLoginButtonWrapper>
            <HisnetLoginButton>히즈넷으로 로그인</HisnetLoginButton>
          </HisnetLoginButtonWrapper>
        )}
      </LeftPane>
      <RightPane>
        <ImageContainer>
          <StyledImage src={landingpic} alt="랜딩페이지 사진" />
        </ImageContainer>
      </RightPane>
    </PageContainer>
  );
}

export default SideBar;


const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPane = styled.div`
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 40px 20px;
    align-items: center;
    text-align: center;
  }
`;

const Logo = styled.h2`
  font-size: 1rem;
  letter-spacing: 2px;
  color: #888;
  margin: 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  line-height: 1.2;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  border-radius: 4px;
  font-size: 0.95rem;
`;

const HisnetLoginButtonWrapper = styled.div`
  button {
    padding: 10px 24px !important;
    font-size: 0.95rem !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
    min-width: auto !important;
    width: auto !important;
  }
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
  padding: 0;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;

  @media (max-width: 768px) {
    object-fit: contain;
  }
`;
