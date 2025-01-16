import { Link, Outlet } from "react-router-dom";
import styled from "styled-components";
import { primary45 } from "../utils/colors";

function Header() {
    return (
        <HeaderContainer>
            <HeaderTitle>
                <span>파일 서명 사이트</span>
                <MenuLink to = "/list">파일 목록</MenuLink>
                <MenuLink to = "/add">파일 추가</MenuLink>
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
    margin-right: 30px;
    &:hover{
        color: green;
    }
`;

const OutletContainer = styled.div`
    width: 100%;
`;
export default Header;