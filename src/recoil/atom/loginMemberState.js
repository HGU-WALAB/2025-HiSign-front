import { atom } from 'recoil';

export const loginMemberState = atom({
  key: 'loginMemberState',
  default: {
        uniqueid: null,
        name: '',
        email: '',
        role: '',
        isLoading: true,
      },
});
