
import { Link } from "react-router-dom";
import styled from 'styled-components';
import HisnetLoginButton from "../components/HisnetLoginButton";

function SideBar() {
    return (
        <SidebarContainer>
            <img src = "/assets/Csee.png" alt = "image"/>
            <NavigationLinks>
                <Link to="/list">List Page</Link>
                <Link to="/add">Add Sign Page</Link>
                <Link to="/upload">Upload Page</Link>
            </NavigationLinks>

        </SidebarContainer>
    )
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






// import { Link } from "react-router-dom";
// import styled from 'styled-components';
// import HisnetLoginButton from "../components/HisnetLoginButton";
// function IntroPage() {

//     return (
//         <CenteredContainer>
//             <Link to = "/list">리스트 페이지</Link>
//             <Link to = "/add">등록 페이지</Link>
//             <Link to = "/upload">등록 페이지</Link>
//             <HisnetLoginButton/>
//         </CenteredContainer>
//     )
// }
// export default IntroPage;

// const CenteredContainer = styled.div`
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 10vh;
//     width: 100%;
//     max-width: 800px;  /* 최대 너비 제한 */
//     padding: 0 50px;  /* 양옆 여백 추가 */
//     margin: 0 auto;  /* 중앙 정렬 */
//     justify-content: space-between
// `;
// import { Link } from "react-router-dom";
// import styled from 'styled-components';
// import HisnetLoginButton from "../components/HisnetLoginButton";

// function IntroPage() {
//     return (
//         <SidebarContainer>
            
//             <Link to="/list">List Page</Link>
//             <Link to="/add">Add Sign Page </Link>
//             <Link to="/upload">Upload Page</Link>
//             <HisnetLoginButton/>
//         </SidebarContainer>
//     )
// }

// export default IntroPage;

// const SidebarContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     height: 100vh;
//     width: 200px;
//     padding: 20px;
//     background-color: #f0f0f0;
//     align-items: flex-start;
//     gap: 15px;
// `;