import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

function SideBar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 상태 관리

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); // 사이드바 열기/닫기 전환
    };

    return (
        <>
            {/* 햄버거 버튼 추가 */}
            <HamburgerButton onClick={toggleSidebar}>
                ☰
            </HamburgerButton>

            {/* 사이드바 */}
            <SidebarContainer isOpen={isSidebarOpen}>
                <img src="/assets/Csee.png" alt="image" />
                <NavigationLinks>
                    <StyledLink to="/list">리스트 페이지</StyledLink>
                    <StyledLink to="/add">서명 추가하기</StyledLink>
                    <StyledLink to="/upload">서명 업로드하기</StyledLink>
                    <StyledLink to="/request">서명자 등록하기</StyledLink>
                    <StyledLink to="/align">얼라인</StyledLink>
                </NavigationLinks>
            </SidebarContainer>
        </>
    );
}

export default SideBar;

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: ${props => (props.isOpen ? "200px" : "0")}; /* 사이드바 열림/닫힘 */
    padding: ${props => (props.isOpen ? "20px" : "0")}; /* 열릴 때만 padding 적용 */
    background-color: white;
    border-right: 1px solid grey; /* 오른쪽 세로 줄 */
    transition: width 0.3s ease, padding 0.3s ease; /* 애니메이션 효과 */
    overflow: hidden; /* 숨길 때 넘치는 부분은 보이지 않게 */
    position: fixed; /* 고정된 위치로 만들기 */
    top: 0;
    left: 0;
    z-index: 1000; /* 햄버거 버튼보다 위에 있도록 설정 */
`;

const HamburgerButton = styled.div`
    display: block;
    font-size: 30px;
    cursor: pointer;
    position: fixed; /* 화면 고정 */
    top: 20px; /* 위쪽 위치 */
    left: 20px; /* 왼쪽 위치 */
    color: black;
    z-index: 2000; /* 사이드바보다 위에 고정 */
`;

const NavigationLinks = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex-grow: 1;
`;

const StyledLink = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    color: white;
    background-color: grey; /* 기본 버튼 색상 */
    border-radius: 50px; /* 둥근 버튼 모양 */
    padding: 10px 20px; /* 버튼 크기 */
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0056b3; /* 호버 시 색상 변경 */
    }

    &:active {
        background-color: #004494; /* 클릭 시 색상 변경 */
    }
`;
