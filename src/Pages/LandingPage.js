import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import HisnetLoginButton from "../components/HisnetLoginButton";
import { authState } from "../recoil/atom/authState";

function SideBar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const auth = useRecoilValue(authState);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (

        <>
            <CenterContainer>
                <h2> 쉽고 빠르게 안전한 전자서명 솔루션 </h2>
                <h1> Hi-Sign </h1>
                <br></br>
                {auth.isAuthenticated ? (
                    <CenterLink to="/tasksetup">서명 요청 시작하기</CenterLink>
                ) : (
                    <HisnetLoginButton>히즈넷으로 로그인</HisnetLoginButton>
                )}
            </CenterContainer>
        </>
    );

}

export default SideBar;

const CenterContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
`;

const SidebarContainer = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'isOpen'
}).attrs(props => ({
    'aria-hidden': !props.isOpen
}))`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: ${({ isOpen }) => (isOpen ? "200px" : "0")};
    padding: ${({ isOpen }) => (isOpen ? "20px" : "0")};
    background-color: white;
    border-right: 1px solid grey;
    transition: width 0.3s ease, padding 0.3s ease;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
`;

const HamburgerButton = styled.div`
    display: block;
    font-size: 30px;
    cursor: pointer;
    position: fixed; /* 화면 고정 */
    top: 5px; /* 위쪽 위치 */
    left: 20px; /* 왼쪽 위치 */
    color: black;
    z-index: 2000;
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
    background-color: grey;
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #0056b3;
    }

    &:active {
        background-color: #004494;
    }
`;

const CenterLink = styled(Link)`
    background-color: #87CEFA;
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease-in-out;
    text-decoration: none;

    &:hover {
        background-color: #4682B4;
    }
`;
