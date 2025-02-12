import { atom } from 'recoil';

export const documentState = atom({
  key: 'documentState',
  default: {
    requestName: '',       // 요청 이름
    ownerId: null,         // 문서 소유자 ID
    fileName: '',          // 문서 이름
    fileUrl: null,        // 선택한 파일 URL 객체 (URL)
    file: null,           // 선택한 파일 객체 (File)
  },
});
