import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import HisnetLogoutButton from "../components/HisnetLogoutButton";
import { loginMemberState } from "../recoil/atom/loginMemberState";

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const loginMember = useRecoilValue(loginMemberState);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleProfileClick = () => setShowLogout((prev) => !prev);
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleClickOutside = (e) => {
    if (
      isMobile &&
      sidebarOpen &&
      !e.target.closest(".sidebar") &&
      !e.target.closest(".toggle-btn")
    ) {
      setSidebarOpen(false);
    }
  };

  const fullName = loginMember.name || "";
  const firstChar = fullName.charAt(0);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {isMobile && (
        <button
          onClick={handleToggleSidebar}
          className="toggle-btn"
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1001,
            background: "#343a40",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: 4,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          ☰
        </button>
      )}
      <aside
        className="sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1rem",
          width: 250,
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #ddd",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
          transition: "transform 0.3s ease-in-out",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          boxShadow:
            sidebarOpen && isMobile ? "0 0 10px rgba(0,0,0,0.1)" : "none",
          overflowY: "auto",
        }}
      >
        <div>
          <Link
            to={loginMember.uniqueId ? "/dashboard" : "/"}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/hisignlogo_resized.png`}
              alt="HI-Sign 로고"
              style={{ height: 120, maxWidth: "100%" }}
            />
          </Link>

          {loginMember.uniqueId && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                paddingLeft: "0.25rem",
                position: "relative",
              }}
            >
              {showLogout && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 50,
                    borderRadius: 10,
                    padding: 1,
                    zIndex: 999,
                  }}
                >
                  <HisnetLogoutButton />
                </div>
              )}
              <div className="fw-bold text-dark">{fullName + "님"}</div>
              {loginMember.role?.trim().toUpperCase() === "ROLE_ADMIN" && (
                  <div className="fw-bold text-dark">{"(관리자)"}</div>
              )}
              <div
                onClick={handleProfileClick}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#343a40",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background-color 0.2s",
                }}
              >
                {firstChar}
              </div>
            </div>
          )}

          {loginMember.uniqueId && (
            <nav style={{ marginTop: "1rem" }}>
              <LinkItem
                to="/tasksetup"
                active={currentPath === "/tasksetup"}
                label = " + 작업 생성하기"
              />
              {/* ✅ 실선 Divider */}
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #ccc",
                  margin: "12px 0",
                }}
              />
              <LinkItem
                to="/request-document"
                active={currentPath === "/request-document"}
                label="[ 내 작업 ] "
              />
              <LinkItem
                to="/receive-document"
                active={currentPath === "/receive-document"}
                label="[ 공유 작업 ] "
              />
              {loginMember.role?.trim().toUpperCase() === "ROLE_ADMIN" && (
                <LinkItem
                  to="/admin-document"
                  active={currentPath === "/admin-document"}
                  label="[ 근무일지 관리 ] "
                />
              )}
            </nav>
          )}
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "#888",
            textAlign: "center",
            paddingTop: "1rem",
          }}
        >
          Copyright © WALAB. HiSign 2025
          <br />
          김솔미 김홍찬 류찬미
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div
          onClick={handleToggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          flexGrow: 1,
          marginLeft: sidebarOpen && !isMobile ? 250 : 0,
          width: "100%",
          transition: "margin-left 0.3s ease-in-out",
          paddingTop: isMobile ? "60px" : 0,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

// 하위 NavItem 컴포넌트 정의
const LinkItem = ({ to, active, label }) => (
  <Link
    to={to}
    style={{
      position: "relative",
      padding: "12px 16px",
      borderRadius: 8,
      backgroundColor: active ? "#e9ecef" : "#f4f4f4",
      marginBottom: 8,
      textDecoration: "none",
      color: "#212529",
      display: "block",
      fontWeight: active ? "bold" : "normal",
      transition: "all 0.2s",
    }}
  >
    {label}
    <span
      style={{
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 12,
        right: 12,
        height: 3,
        backgroundColor: active ? "#1a73e8" : "transparent",
        borderRadius: 2,
        transition: "background-color 0.3s",
      }}
    ></span>
  </Link>
);

export default Sidebar;
