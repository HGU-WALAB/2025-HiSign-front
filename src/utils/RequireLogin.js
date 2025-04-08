import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { loginMemberState } from "../recoil/atom/loginMemberState"; // 로그인 상태 전역 관리

const RequireLogin = ({ children }) => {
  const loginUser = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loginUser.isLoading && !loginUser?.unique_id) {
      alert("로그인이 필요합니다.");
      navigate("/");  // 로그인 페이지로 이동
    }
  }, [loginUser, navigate]);

  // 로딩 중일 경우 아무 것도 렌더링하지 않음
  if (loginUser.isLoading) return null;

  return children;
};

export default RequireLogin;
