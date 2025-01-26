import { atom } from 'recoil';

export const signerState = atom({
  key: 'signerState',  // 상태의 고유 키
  default: [],         // 기본값: 빈 배열
});

// {
//   name: '홍길동',       // 서명자의 이름
//   email: 'hong@example.com',  // 서명자의 이메일
//   signatureFields: [
//    {
//      type: 1,
//      position: {
//        pageNumber: 1,
//        x: 100,
//        y: 150
//      },
//      width: 200,
//      height: 50
//    }
//    ]
// }