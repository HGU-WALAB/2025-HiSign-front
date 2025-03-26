// import { Link, Outlet } from "react-router-dom";
// import { useRecoilValue } from "recoil";
// import HisnetLoginButton from "../components/HisnetLoginButton";
// import HisnetLogoutButton from "../components/HisnetLogoutButton";
// import { authState } from "../recoil/atom/authState";
// import { loginMemberState } from "../recoil/atom/loginMemberState"; // 로그인한 사용자 정보 가져오기

// function HeaderBar() {
//     const auth = useRecoilValue(authState);
//     const loginMember = useRecoilValue(loginMemberState); // 로그인한 멤버 정보

//     return (
//         <div className="d-flex flex-column w-100">
//             <header
//                 className="d-flex align-items-center justify-content-between p-3"
//                 style={{
//                     height: "80px",
//                     backgroundColor: "white",
//                     borderBottom: "1px solid #ddd",
//                     boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.08)",
//                     position: "fixed",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     zIndex: 1000
//                 }}
//             >
//                 <Link to="/" className="text-decoration-none text-dark fs-4 ms-3">
//                     <img
//                         src={`${process.env.PUBLIC_URL}/hi-sign-logo.png`}
//                         alt="HI-Sign 로고"
//                         style={{ height: "80px" }}
//                     />
//                 </Link>
                
//                 {auth.isAuthenticated && (
//                     <div className="d-flex gap-3">
//                         <Link to="/request-document" className="nav-link text-dark">
//                             요청한 작업
//                         </Link>
//                         <Link to="/receive-document" className="nav-link text-dark">
//                             요청받은 작업
//                         </Link>
//                         <Link to="/tasksetup" className="nav-link text-dark">
//                             문서 업로드하기
//                         </Link>
//                         <Link to="/request" className="nav-link text-dark">
//                             서명자 등록하기
//                         </Link>
//                         <Link to="/align" className="nav-link text-dark">
//                             서명 할당하기
//                         </Link>
//                         <Link to="/contact" className="nav-link text-dark">
//                             문의 페이지
//                         </Link>
//                     </div>
//                 )}

//                 <div className="d-flex align-items-center gap-3 me-3">
//                     {auth.isAuthenticated && loginMember.name ? (
//                         <span className="fw-bold text-dark">{loginMember.name}님, 반갑습니다!</span>
//                     ) : null}

//                     {auth.isAuthenticated ? <HisnetLogoutButton /> : <HisnetLoginButton />}
//                 </div>
//             </header>
//             <div className="w-100" >
//                 <Outlet/>
//             </div>
//         </div>
//     );
// }

// export default HeaderBar;
