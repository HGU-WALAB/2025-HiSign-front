import { atom } from 'recoil';

export const taskState = atom({
  key: 'taskState',
  default: {
    requestName: '',       // 작업 이름
    description: '',       // 작업 설명
    ownerId: null,         // 문서 소유자 ID
    fileName: '',          // 문서 이름
    fileUrl: null,        // 선택한 파일 URL 객체 (URL)
    // file: null,           // 선택한 파일 객체 (File)
    isRejectable : null,  // 거부 가능 여부
    type: null,
  },
});
