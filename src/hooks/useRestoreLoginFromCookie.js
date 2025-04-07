// hooks/useRestoreLoginFromCookie.js
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
        //console.log("✅ 로그인 정보 복원 성공:", user);

        setLoginState({
          unique_id: user.uniqueId,
          name: user.name,
          email: user.email,
          role: user.level === 0? "ROLE_USER" : user.level === 1? "ROLE_ADMIN" : "ROLE_ADMIN",
        });

        console.log("✅ 로그인 정보 복원 성공:", user);
      } catch (error) {
        console.log("🚫 로그인 정보 복원 실패 (비로그인 상태일 수 있음):", error);
        // 필요시 setLoginState를 초기화할 수도 있습니다.
      }
    };

    restoreLogin();
  }, []);
};

export default useRestoreLoginFromCookie;
