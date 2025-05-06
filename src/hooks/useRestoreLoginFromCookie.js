// hooks/useRestoreLoginFromCookieuseRestoreLoginFromCookie.js
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { loginMemberState } from '../recoil/atom/loginMemberState';
import ApiService from '../utils/ApiService';

const useRestoreLoginFromCookie = () => {
  const setLoginState = useSetRecoilState(loginMemberState);

  useEffect(() => {
    const restoreLogin = async () => {
      try {
        const response = await ApiService.fetchMyInfo(); // 예: GET /auth/me
        const user = response.data;
        ////console.log("✅ 로그인 정보 복원 성공:", user);

        setLoginState({
          uniqueId: user.uniqueId,
          name: user.name,
          email: user.email,
          role: user.level === 0? "ROLE_USER" : user.level === 1? "ROLE_ADMIN" : "ROLE_ADMIN",
          isLoading: false, // 🔽 복원 완료
        });

        ////console.log("✅ 로그인 정보 복원 성공:", user);
      } catch (error) {
        //console.log("🚫 로그인 정보 복원 실패 (비로그인 상태일 수 있음):", error);
        setLoginState(prev => ({
          ...prev,
          isLoading: false, // 🔽 로그인 복원 실패이더라도 로딩 완료 처리
        }));
      }
    };

    restoreLogin();
  }, []);
};

export default useRestoreLoginFromCookie;
