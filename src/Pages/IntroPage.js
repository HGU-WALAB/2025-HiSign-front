import { Link } from "react-router-dom";
import styled from 'styled-components';

function SideBar() {
    return (
        <SidebarContainer>
            <img src="/assets/Csee.png" alt="image" />
            <NavigationLinks>
                <br></br>
                <StyledLink to="/list">리스트 페이지</StyledLink>
                <StyledLink to="/add">서명 추가하기</StyledLink>
                <StyledLink to="/upload">서명 업로드하기</StyledLink>
                <StyledLink to="/request">서명자 등록하기</StyledLink>
                <StyledLink to="/align">얼라인</StyledLink>
            </NavigationLinks>
        </SidebarContainer>
    );
}

export default SideBar;

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 200px;
    padding: 20px;
    background-color: #f0f0f0;
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
    background-color: #007bff; /* 기본 버튼 색상 */
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
