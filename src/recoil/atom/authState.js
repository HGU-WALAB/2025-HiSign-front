import { atom } from 'recoil';

export const authState = atom({
  key: 'authState',
  default: {
    isAuthenticated: !!sessionStorage.getItem('token'),  // 토큰이 존재하는지 여부로 로그인 상태 결정
  },
});