import { atom } from 'recoil';

export const signingState = atom({
  key: 'signingState',
  default: {
    signerEmail: '',  // 서명자의 이메일
    signerName: '',   // 서명자의 이름 (API 요청에 필요)
    documentId: null, // 서명할 문서 ID
    documentName: '', // 서명할 문서 이름
    fileUrl: '',      // 서명할 문서의 PDF 파일 URL
    signatureFields: [], // ✅ 모든 필드에 `signerEmail` 포함
  },
});

/*
{
  signerEmail: "",
  documentId: null,
  signatureFields: [
      {
      "type": 0,
      "position": {
        "pageNumber": 1,
        "x": 100,
        "y": 150
      },
      "width": 200,
      "height": 50,
      imagePath: ""
    },
    {
      "type": 1,
      "position": {
        "pageNumber": 2,
        "x": 150,
        "y": 200
      },
      "width": 150,
      "height": 40,
      "text": "홍길동"  // ✅ 서명 필드 내부에 텍스트 직접 저장
    }],
}
*/
