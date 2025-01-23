import { selector } from 'recoil';
import { signerState } from '../recoil/atom/signerState';

export const signerCountState = selector({
  key: 'signerCountState',  // 고유 키
  get: ({ get }) => {
    const signers = get(signerState);
    return signers.length;  // 서명자 수 반환
  },
});
