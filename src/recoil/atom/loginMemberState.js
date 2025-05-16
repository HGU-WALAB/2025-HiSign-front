import { atom } from 'recoil';

export const loginMemberState = atom({
  key: 'loginMemberState',
  default: {
        uniqueId: null,
        name: '',
        email: '',
        role: '',
        isLoading: true,
      },
});
