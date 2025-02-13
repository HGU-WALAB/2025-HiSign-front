import { atom } from 'recoil';

export const signingState = atom({
  key: 'signingState',
  default: {
    signerEmail: '',  // 서명자의 이메일
    documentId: null, // 서명할 문서 ID
    documentName: '', // 서명할 문서 이름
    fileUrl: '',      // 서명할 문서의 PDF 파일 URL
    signatureFields: [], // 서명자의 서명 필드 정보 (텍스트 추가됨)
    image: "", // ✅ 서명 이미지 저장 (하나만 존재)
  },
});

/*
예제:
{
  "signerEmail": "hong@example.com",
  "documentId": 123,
  "documentName": "계약서.pdf",
  "fileUrl": "blob:http://localhost:3000/abcd-1234",
  "signatureFields": [
    {
      "type": 0,
      "position": {
        "pageNumber": 1,
        "x": 100,
        "y": 150
      },
      "width": 200,
      "height": 50
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
    }
  ],
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..." // ✅ 단일 이미지 관리
}


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
