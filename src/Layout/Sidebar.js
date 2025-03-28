import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import HisnetLoginButton from "../components/HisnetLoginButton";
import HisnetLogoutButton from "../components/HisnetLogoutButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";

function Sidebar() {
    const loginMember = useRecoilValue(loginMemberState);
    const [showLogout, setShowLogout] = useState(false);

    const handleProfileClick = () => {
        setShowLogout(prev => !prev);
    };

    const fullName = loginMember.name || "";
    const firstChar = fullName.charAt(0);

    return React.createElement(
        "div",
        { className: "d-flex", style: { minHeight: "100vh" } },

        // Sidebar
        React.createElement(
            "aside",
            {
                className: "d-flex flex-column justify-content-between p-3",
                style: {
                    width: "250px",
                    backgroundColor: "#f8f9fa",
                    borderRight: "1px solid #ddd",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                },
            },
            // 상단 학부생 이름만 표시
            React.createElement("div", null,
                React.createElement(Link, {
                    to: "/",
                    className: "text-decoration-none text-dark fs-4 mb-4 d-block"
                },
                    React.createElement("img", {
                        src: `${process.env.PUBLIC_URL}/hi-sign-logo.png`,
                        alt: "HI-Sign 로고",
                        style: { height: "60px" }
                    })
                ),
                !!loginMember.unique_id && React.createElement(
                    "div",
                    { className: "fw-bold text-dark mb-4 ps-1" },
                    fullName // ex: "김솔미"
                ),
                !!loginMember.unique_id && React.createElement("nav", { className: "nav flex-column gap-2" },
                    React.createElement(Link, { to: "/request-document", className: "nav-link text-dark" }, "요청한 작업"),
                    React.createElement(Link, { to: "/receive-document", className: "nav-link text-dark" }, "요청받은 작업"),
                    React.createElement(Link, { to: "/tasksetup", className: "nav-link text-dark" }, "문서 업로드하기"),
                    React.createElement(Link, { to: "/request", className: "nav-link text-dark" }, "서명자 등록하기"),
                    React.createElement(Link, { to: "/align", className: "nav-link text-dark" }, "서명 할당하기"),
                    React.createElement(Link, { to: "/contact", className: "nav-link text-dark" }, "문의 페이지")
                )
            ),

            // 하단 프로필
            !!loginMember.unique_id ? React.createElement(
                "div",
                { className: "mt-auto", style: { position: "relative" } },
                React.createElement(
                    "div",
                    {
                        onClick: handleProfileClick,
                        style: {
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#343a40",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            userSelect: "none",
                        }
                    },
                    firstChar
                ),
                showLogout && React.createElement(
                    "div",
                    {
                        style: {
                            position: "absolute",
                            left: "50px",
                            bottom: "0",
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            padding: "5px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            zIndex: 999,
                        }
                    },
                    React.createElement(HisnetLogoutButton, null)
                )
            ) : React.createElement(HisnetLoginButton, null)
        ),

        // Main Content
        React.createElement(
            "div",
            {
                className: "flex-grow-1",
                style: { marginLeft: "250px", padding: "20px" }
            },
            React.createElement(Outlet, null)
        )
    );
}

export default Sidebar;
