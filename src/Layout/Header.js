import { Link, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import HisnetLoginButton from "../components/HisnetLoginButton";
import LogoutButton from "../components/LogoutButton";
import { authState } from "../recoil/atom/authState";
import { primary45 } from "../utils/colors";

function Header() {
    const auth = useRecoilValue(authState);

    return (
        <HeaderContainer>
            <HeaderTitle>
                <MenuLink to = "/">HI-Sign</MenuLink>
                <MenuLink to = "/list">파일 목록</MenuLink>
                <MenuLink to = "/add">파일 추가</MenuLink>
                <MenuLink to = "/upload">파일 업로드</MenuLink>
                {auth.isAuthenticated ? <LogoutButton/> : <HisnetLoginButton/>}
            </HeaderTitle>
            <OutletContainer>
                <Outlet/>
            </OutletContainer>
        </HeaderContainer>
    )
}

const HeaderContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const HeaderTitle = styled.div`
    width: 100%;
    height : 50px;
    background-color: ${primary45};
    display: flex;
    align-items: center;

    padding-left: 30px;
    box-sizing: border-box;
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: black;
    margin: 0 15px 0 15px;
    &:hover{
        color: green;
    }
`;

const OutletContainer = styled.div`
    width: 100%;
`;
export default Header;