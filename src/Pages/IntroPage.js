import { Link } from "react-router-dom";
import styled from 'styled-components';
import HisnetLoginButton from "../components/HisnetLoginButton";
function IntroPage() {

    return (
        <CenteredContainer>
            <Link to = "/list">리스트 페이지</Link>
            <Link to = "/add">등록 페이지</Link>
            <Link to = "/upload">등록 페이지</Link>
            <HisnetLoginButton/>
        </CenteredContainer>
    )
}
export default IntroPage;

const CenteredContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10vh;
    width: 100%;
    max-width: 800px;  /* 최대 너비 제한 */
    padding: 0 50px;  /* 양옆 여백 추가 */
    margin: 0 auto;  /* 중앙 정렬 */
    justify-content: space-between
`;