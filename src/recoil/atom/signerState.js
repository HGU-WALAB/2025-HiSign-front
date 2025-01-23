import { atom } from 'recoil';

export const signerState = atom({
  key: 'signerState',  // 상태의 고유 키
  default: [],         // 기본값: 빈 배열
});