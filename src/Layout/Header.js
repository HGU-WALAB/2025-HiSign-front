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
                        <MenuLink to="/list">리스트 페이지</MenuLink>
                        <MenuLink to="/upload">문서 업로드하기</MenuLink>
                        <MenuLink to="/request">서명자 등록하기</MenuLink>
                        <MenuLink to="/align">서명 할당하기</MenuLink>
                    </NavigationLinks>
                )}
                <ButtonContainer>
                    {auth.isAuthenticated ? <HisnetLogoutButton /> : <HisnetLoginButton />}
                </ButtonContainer>
            </HeaderBarTitle>
            <OutletContainer>
                <Outlet/>
            </OutletContainer>
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
    &:hover {
        color: green;
    }
`;

const OutletContainer = styled.div`
    width: 100%; 
`;

export default HeaderBar;
