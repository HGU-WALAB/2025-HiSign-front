import { atom } from 'recoil';

// JWT 토큰 디코딩 함수
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error("JWT 디코딩 오류:", error);
    return null;
  }
};

// 세션 스토리지에서 토큰 가져오기
const token = sessionStorage.getItem('token');
const decodedToken = token ? decodeJWT(token) : null;

export const memberState = atom({
  key: 'memberState',
  default: decodedToken
    ? {
        unique_id: decodedToken.unique_id || null,
        name: decodedToken.name || '',
        email: decodedToken.email || '',
        level: decodedToken.level || '',
      }
    : {
        unique_id: null,
        name: '',
        email: '',
        level: '',
      },
});
