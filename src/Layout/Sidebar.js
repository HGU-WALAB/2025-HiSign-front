import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import HisnetLoginButton from "../components/HisnetLoginButton";
import HisnetLogoutButton from "../components/HisnetLogoutButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const loginMember = useRecoilValue(loginMemberState);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleProfileClick = () => setShowLogout((prev) => !prev);
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  // 사이드바 외부 클릭 시 닫히는 기능 추가
  const handleClickOutside = (e) => {
    if (
      isMobile &&
      sidebarOpen &&
      !e.target.closest(".sidebar") &&
      !e.target.closest(".toggle-btn")
    ) {
      setSidebarOpen(false);
    }
  };

  const fullName = loginMember.name || "";
  const firstChar = fullName.charAt(0);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  return (
    <Container>
      {/* 햄버거 버튼 (모바일) */}
      {isMobile && (
        <ToggleButton onClick={handleToggleSidebar} className="toggle-btn">
          ☰
        </ToggleButton>
      )}

  
      <SidebarWrapper
        className="sidebar"
        $isOpen={sidebarOpen}
        $isMobile={isMobile}
      >
        <div>
          <LogoLink
            to="/"
            className="text-decoration-none text-dark fs-4 mb-4 d-block"
          >
            <LogoImage
              src={`${process.env.PUBLIC_URL}/hisignlogo_resized.png`}
              alt="HI-Sign 로고"
            />
          </LogoLink>

          {!!loginMember.uniqueId && (
            <ProfileContainer>
              {showLogout && (
                <LogoutContainer>
                  <HisnetLogoutButton />
                </LogoutContainer>
              )}
              <div className="fw-bold text-dark">{fullName + "님"}</div>
              <ProfileCircle onClick={handleProfileClick}>
                {firstChar}
              </ProfileCircle>
            </ProfileContainer>
          )}

          {!loginMember.uniqueId && (

            <div className="mb-4">
              <HisnetLoginButton />
            </div>
          )} */}

          {!!loginMember.uniqueId && (
            <Nav className="nav flex-column">
              <NavItem
                to="/request-document"
                $active={currentPath === "/request-document"}
              >
                내 작업
              </NavItem>
              <NavItem
                to="/receive-document"
                $active={currentPath === "/receive-document"}
              >
                공유 작업
              </NavItem>
              <NavItem to="/tasksetup" $active={currentPath === "/tasksetup"}>
                문서 업로드하기
              </NavItem>
              <NavItem to="/request" $active={currentPath === "/request"}>
                서명자 등록하기
              </NavItem>
            </Nav>
          )}
        </div>

        <Copyright>
          Copyright © WALAB. HiSign 2025
          <br />
          김솔미 김홍찬 류찬미
        </Copyright>
      </SidebarWrapper>

      {isMobile && sidebarOpen && <Overlay onClick={handleToggleSidebar} />}

      {/* Main Content */}
      <MainContent $sidebarOpen={sidebarOpen} $isMobile={isMobile}>
        <Outlet />
      </MainContent>
    </Container>
  );
}

export default Sidebar;

// 스타일드 컴포넌트 정의
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  background: #343a40;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #495057;
  }
`;

const SidebarWrapper = styled.aside`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
  box-shadow: ${(props) =>
    props.$isOpen && props.$isMobile ? "0 0 10px rgba(0,0,0,0.1)" : "none"};
  overflow-y: auto;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const LogoLink = styled(Link)`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const LogoImage = styled.img`
  height: 120px;
  max-width: 100%;
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-left: 0.25rem;
  position: relative;
`;

const ProfileCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #343a40;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #495057;
  }
`;

const LogoutContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 50px;
  border-radius: 10px;
  padding: 1px;
  z-index: 999;
  /* background-color: white; */
  //box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  margin-top: 1rem;
`;

const NavItem = styled(Link)`
  position: relative;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? "#e9ecef" : "#f4f4f4")};
  margin-bottom: 8px;
  text-decoration: none;
  color: #212529;
  display: block;
  transition: all 0.2s;
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};

  &:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 3px;
    background-color: ${({ $active }) => ($active ? "#1a73e8" : "transparent")};
    border-radius: 2px;
    transition: background-color 0.3s;
  }
`;

const Copyright = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: #888;
  text-align: center;
  padding-top: 1rem;
`;

const MainContent = styled.div`
  flex-grow: 1;
  margin-left: ${(props) =>
    props.$sidebarOpen && !props.$isMobile ? "250px" : "0"};
  width: 100%;
  transition: margin-left 0.3s ease-in-out;
  padding-top: ${(props) => (props.$isMobile ? "60px" : "0")};
`;
