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

const HeaderBarContainer = styled.div`
    width: 100%;
    flex-direction: column;
    
`;

const HeaderBarTitle = styled.div`
    width: 100%;
    height: 50px;
    background-color: skyblue;
    display: flex;
    align-items: center;
    padding-left: 15px;
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