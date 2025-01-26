import { atom } from 'recoil';

export const memberState = atom({
  key: 'memberState',
  default: {
    unique_id: null,          // 사용자 ID
    name: '',          // 사용자 이름
    email: '',         // 사용자 이메일
    level: '',         // 사용자 권한
  },
});