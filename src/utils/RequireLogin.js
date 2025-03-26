import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loginMemberState } from "../recoil/atom/loginMemberState";

const RequireLogin = ({ children }) => {
  const loginUser = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loginUser?.unique_id) {
      alert("로그인이 필요합니다.");
      sessionStorage.removeItem("token");
      navigate("/");  // 로그인 페이지로 이동
    }
  }, [loginUser, navigate]);

  return children;
};

export default RequireLogin;
