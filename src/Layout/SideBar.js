import { Outlet } from "react-router-dom";
import styled from "styled-components";

function SideBar() {
    return (
        <SideBarContainer>
            <SideBarTitle>SideBar</SideBarTitle>
            <Outlet/>
        </SideBarContainer>
    )
}

const SideBarContainer = styled.div`
    width: 100%;
    display: flex;
`;

const SideBarTitle = styled.div`
    width: 150px;
    background-color: orange;
`;

export default SideBar;