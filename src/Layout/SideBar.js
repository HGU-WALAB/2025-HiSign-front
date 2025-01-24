
// 이 파일은 안 쓰는 것으로 간주
//사이드바를 제거하고 인트로페이지에 합침



// import { Link } from "react-router-dom";
// import styled from 'styled-components';

// function SideBar() {
    
//     return (
//         <SidebarContainer>
//             <NavigationLinks>
//                 <Link to="/list">List Page</Link>
//                 <Link to="/add">Add Sign Page</Link>
//                 <Link to="/upload">Upload Page</Link>
//                 <Link to="/template">Choice Template</Link>
//             </NavigationLinks>

//         </SidebarContainer>
//     )
// }

// export default SideBar;

// const SidebarContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     height: 100vh;
//     width: 200px;
//     padding: 20px;
//     background-color: #f0f0f0;
// `;

// const NavigationLinks = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 15px;
//     flex-grow: 1;
// `;



//////안씀 얘가 intropage -> side bar 를 뜻함 





// import { Outlet } from "react-router-dom";
// import styled from "styled-components";

// function SideBar() {
//     return (
//         <SideBarContainer>
//             <SideBarTitle>SideBar</SideBarTitle>
//             <Outlet/>
//         </SideBarContainer>
//     )
// }

// const SideBarContainer = styled.div`
//     width: 100%;
//     display: flex;ㅎ
// `;

// const SideBarTitle = styled.div`
//     width: 150px;
//     background-color: orange;
// `;

// export default SideBar;

// //위에가 원래 사이드바 코드 


// ////// 아래가 헤더에서 가지고 온 코드 
// import { Link, Outlet } from "react-router-dom";
// import { useRecoilValue } from "recoil";
// import styled from "styled-components";
// import HisnetLoginButton from "../components/HisnetLoginButton";
// import LogoutButton from "../components/LogoutButton";
// import { authState } from "../recoil/atom/authState";
// import { primary45 } from "../utils/colors";

// function  SideBar() {
//     const auth = useRecoilValue(authState);

//     return (
//         <SideBarContainer>
//             <SideBarTitle>
//                 <MenuLink to = "/">HI-Sign</MenuLink>
//             </SideBarTitle>
//             <OutletContainer>
//                 <Outlet/>
//             </OutletContainer>
//         </SideBarContainer>
//     )
// }

// const SideBarContainer = styled.div`
//     width: 100%;
//     /* display: flex; */
//     flex-direction: column;
    
// `;

// const SideBarTitle = styled.div`
//     width: 100%;
//     height : 50px;
//     background-color: ${primary45};
//     display: flex;
//     align-items: center;

//     padding-left: 30px;
//     box-sizing: border-box;
//     background-color: skyblue
// `;

// const MenuLink = styled(Link)`
//     text-decoration: none;
//     color: black;
//     margin: 0 15px 0 15px;
//     &:hover{
//         color: green;
//     }
// `;

// const OutletContainer = styled.div`
//     width: 100%;
// `;
// export default SideBar;