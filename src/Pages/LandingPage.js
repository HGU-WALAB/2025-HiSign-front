import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import HisnetLoginButton from "../components/HisnetLoginButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";

function SideBar() {
    const loginMember = useRecoilValue(loginMemberState);

    return (

        <>
            <CenterContainer>
                <h2> 쉽고 빠르게 안전한 전자서명 솔루션 </h2>
                <h1> Hi-Sign </h1>
                <br></br>
                { !!loginMember.unique_id ? (
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
