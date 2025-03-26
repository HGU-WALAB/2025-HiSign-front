import { atom } from 'recoil';

export const loginMemberState = atom({
  key: 'loginMemberState',
  default: {
        unique_id: null,
        name: '',
        email: '',
        level: '',
      },
});
