import { atom } from 'recoil';

export const documentState = atom({
  key: 'documentState',
  default: {
    id: null,          // 문서 ID (업로드 시 생성됨)
    name: '',          // 문서 이름
    file: null,        // 선택한 파일 객체 (Blob or File)
  },
});
