import { Link, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import HisnetLoginButton from "../components/HisnetLoginButton";
import HisnetLogoutButton from "../components/HisnetLogoutButton";
import { authState } from "../recoil/atom/authState";

function HeaderBar() {
    const auth = useRecoilValue(authState);
    
    return (
        <HeaderBarContainer>
            <HeaderBarTitle>
                <MenuLink to="/">HI-Sign</MenuLink>
                {auth.isAuthenticated && (
                    <NavigationLinks>
                        <MenuLink to="/request-document">요청한 리스트 페이지</MenuLink>
                        <MenuLink to="/receive-document">요청받은 리스트 페이지</MenuLink>
                        <MenuLink to="/upload">문서 업로드하기</MenuLink>
                        <MenuLink to="/request">서명자 등록하기</MenuLink>
                        <MenuLink to="/align">서명 할당하기</MenuLink>
                        <MenuLink to="/make">예제 페이지</MenuLink>
                    </NavigationLinks>
                )}
                <ButtonContainer>
                    {auth.isAuthenticated ? <HisnetLogoutButton /> : <HisnetLoginButton />}
                </ButtonContainer>
            </HeaderBarTitle>
            <MainContent>
                <Outlet/>
            </MainContent>
        </HeaderBarContainer>
    )
}

const NavigationLinks = styled.div`
    display: flex;
    flex-direction: row;
    gap: 15px;
    flex-grow: 1;
`;

const HeaderBarContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const HeaderBarTitle = styled.div`
    width: 100%;
    height: 80px;
    background-color: skyblue;
    display: flex;
    align-items: center;
    padding-left: 20px;
    box-sizing: border-box;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 15px;
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: black;
    margin: 0 15px 0 45px;
    padding: 8px 16px;
    background-color: white;
    border-radius: 4px;
    transition: all 0.3s ease;
    
    &:hover {
        color: white;
        background-color: #4CAF50;
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
`;

const MainContent = styled.div`
    width: 100%;
    margin-top: 80px; // HeaderBarTitle의 height와 동일한 값
`;

export default HeaderBar;