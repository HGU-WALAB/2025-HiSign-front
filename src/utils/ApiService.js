import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const HISNET_LOGIN_URL = `${process.env.REACT_APP_HISNET_URL}/HisnetLogin/hisnet-login`;
const HISET_RETURN_URL = process.env.REACT_APP_HISET_RETURN_URL;
const HISNET_ACCESS_KEY = process.env.REACT_APP_HISNET_ACCESS_KEY;

// Axios 인스턴스 생성
const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 오류 처리 (토큰 만료 시 로그아웃)
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert('다시 로그인해 주세요.');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  // 파일 업로드
  uploadDocument: async (file, uniqueId) => {
    if (!file) throw new Error('업로드할 파일이 없습니다.');
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('unique_id', uniqueId);

    return apiInstance.post('/files/document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 문서 목록 가져오기
  fetchDocuments: async (type) => {
    if (type === 'requested') {
      // 요청한 문서 리스트 API 호출
      return apiInstance.get('/documents/requested-documents');
    } else if (type === 'received') {
      // 요청받은 문서 리스트 API 호출
      return apiInstance.get('/documents/received-documents');
    } else {
      throw new Error('Invalid document type specified');
    }
  },


  // 특정 문서 가져오기 (PDF 다운로드)
  fetchDocument: async (documentId) => {
    return apiInstance.get(`/documents/${documentId}`, { responseType: 'arraybuffer' });
  },

  // 문서 삭제
  deleteDocument: async (documentId) => {
    if (!documentId) throw new Error('문서 ID가 필요합니다.');
  
    try {
      const response = await apiInstance.delete(`/documents/${documentId}`);
      return response.data;  // 성공 메시지 반환
    } catch (error) {
      console.error('문서 삭제 중 오류 발생:', error);
      throw new Error(error.response?.data || '문서 삭제 실패');
    }
  },
  rejectSignatureRequest: async (documentId) => {
    if (!documentId) throw new Error("문서 ID가 필요합니다.");
    return apiInstance.put(`/signature-requests/reject/${documentId}`);
  },

  // 서명 요청 전송
  sendSignatureRequest: async (documentId, signers) => {
    if (!documentId) throw new Error('문서 정보가 없습니다.');
    if (signers.length === 0) throw new Error('서명자를 추가해주세요.');

    const requestData = { documentId, signers };
    return apiInstance.post('/signature-requests/request', requestData);
  },

  // 서명 요청 취소
  cancelSignatureRequest: async (documentId) => {
    if (!documentId) throw new Error('문서 ID가 필요합니다.');

    return apiInstance.put(`/signature-requests/cancel/${documentId}`);
  },

  // 히즈넷 로그인
  loginWithHisnet: () => {
    const url = `${HISNET_LOGIN_URL}?returnUrl=${encodeURIComponent(HISET_RETURN_URL)}&accessKey=${encodeURIComponent(HISNET_ACCESS_KEY)}`;
    window.location.href = url;
  },

  // 로그인 요청
  login: async (hisnetToken) => {
    return axios.post(`${BASE_URL}/auth/login`, { hisnetToken }, {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  },
};

export default ApiService ;


//버셀 서버리스 함수 사용 버전
// import axios from 'axios';

// //.env: REACT_APP_API_SERVERLESS_URL=https://hisign.vercel.app/api
// const BASE_URL = process.env.REACT_APP_API_SERVERLESS_URL;
// const HISNET_LOGIN_URL = `${process.env.REACT_APP_HISNET_URL}/HisnetLogin/hisnet-login`;
// const HISET_RETURN_URL = process.env.REACT_APP_HISET_RETURN_URL;
// const HISNET_ACCESS_KEY = process.env.REACT_APP_HISNET_ACCESS_KEY;

// // Axios 인스턴스 생성
// const apiInstance = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 요청 인터셉터: JWT 토큰 자동 추가
// apiInstance.interceptors.request.use(
//   (config) => {
//     const token = sessionStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 응답 인터셉터: 401 오류 처리 (토큰 만료 시 로그아웃)
// apiInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       alert('다시 로그인해 주세요.');
//       sessionStorage.removeItem('token');
//       window.location.href = '/';
//     }
//     return Promise.reject(error);
//   }
// );

// const ApiService = {
//   // 파일 업로드
//   uploadDocument: async (file, uniqueId) => {
//     if (!file) throw new Error('업로드할 파일이 없습니다.');
//     const formData = new FormData();
//     formData.append('file', file, file.name);
//     formData.append('unique_id', uniqueId);

//     return apiInstance.post('/files/document/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   },

//   // 문서 목록 가져오기
//   fetchDocuments: async () => {
//     return apiInstance.get('/documents/list');
//   },

//   // 특정 문서 가져오기 (PDF 다운로드)
//   fetchDocument: async (documentId) => {
//     return apiInstance.get(`/documents/${documentId}`, { responseType: 'arraybuffer' });
//   },

//   // 문서 삭제
//   deleteDocument: async (documentId) => {
//     if (!documentId) throw new Error('문서 ID가 필요합니다.');

//     try {
//       const response = await apiInstance.delete(`/documents/${documentId}`);
//       return response.data; // 성공 메시지 반환
//     } catch (error) {
//       console.error('문서 삭제 중 오류 발생:', error);
//       throw new Error(error.response?.data || '문서 삭제 실패');
//     }
//   },

//   // 서명 요청 전송
//   sendSignatureRequest: async (documentId, signers) => {
//     if (!documentId) throw new Error('문서 정보가 없습니다.');
//     if (signers.length === 0) throw new Error('서명자를 추가해주세요.');

//     const requestData = { documentId, signers };
//     return apiInstance.post('/signature-requests/request', requestData);
//   },

//   // 서명 요청 취소
//   cancelSignatureRequest: async (documentId) => {
//     if (!documentId) throw new Error('문서 ID가 필요합니다.');

//     return apiInstance.put(`/signature-requests/cancel/${documentId}`);
//   },

//   // 히즈넷 로그인 리다이렉트
//   loginWithHisnet: () => {
//     const url = `${HISNET_LOGIN_URL}?returnUrl=${encodeURIComponent(HISET_RETURN_URL)}&accessKey=${encodeURIComponent(HISNET_ACCESS_KEY)}`;
//     window.location.href = url;
//   },

//   // 로그인 요청 (히즈넷 토큰 전송)
//   login: async (hisnetToken) => {
//     return apiInstance.post('/authLogin', { hisnetToken }, { timeout: 20000 });
//   },
// };

// export default ApiService;