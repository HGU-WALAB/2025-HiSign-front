import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isLoggingOutState } from "../recoil/atom/isLoggingOutState";
import { loginMemberState } from "../recoil/atom/loginMemberState";

const RequireLogin = ({ children }) => {
  const loginUser = useRecoilValue(loginMemberState);
  const isLoggingOut = useRecoilValue(isLoggingOutState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log("▶️ RequireLogin 실행");
    // console.log("  ⮑ location:", location.pathname);
    // console.log("  ⮑ loginUser:", loginUser);
    // console.log("  ⮑ isLoggingOut:", isLoggingOut);

    if (loginUser.isLoading) {
      //console.log("⏳ 로딩 중 - 아무 것도 하지 않음");
      return;
    }

    if (isLoggingOut) {
      //console.log("🚪 로그아웃 중 - 아무 것도 하지 않음");
      return;
    }

    if (!loginUser?.uniqueId) {
      //console.log("🚨 로그인 필요함 - alert 띄움");
      alert("로그인이 필요합니다.");
      navigate("/");
    }
  }, [loginUser, navigate, location, isLoggingOut]);

  if (loginUser.isLoading) return null;

  return loginUser?.uniqueId ? children : null;
};

export default RequireLogin;
