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

const PublicaApiInstance = axios.create({
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

  // 서명 요청 토큰 유효성 확인
  checkSignatureToken: async (token) => {
    if (!token) throw new Error('토큰이 없습니다.');
  
    try {
      const response = await PublicaApiInstance.get(`/signature-requests/check?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('서명 요청 토큰 검증 실패:', error);
      throw new Error(error.response?.data || '토큰이 유효하지 않습니다.');
    }
  },
  // 서명 요청 검증 (이메일 입력 후)
  validateSignatureRequest: async (token, email) => {
    if (!token || !email) throw new Error('토큰과 이메일이 필요합니다.');

    try {
      const response = await PublicaApiInstance.post('/signature-requests/validate', { token, email });
      return response.data; // 서명할 문서 정보 반환
    } catch (error) {
      console.error('서명 요청 검증 실패:', error);
      throw new Error(error.response?.data || '인증 실패');
    }
  },

  // 🔹 특정 문서에서 특정 서명자의 서명 필드 조회
  fetchSignatureFields: async (documentId, signerEmail) => {
    return PublicaApiInstance.post(`/signature/fields`, { documentId, signerEmail });
  },

  // 🔹 서명을 위한 문서 불러오기 
  fetchDocumentForSigning: async (documentId) => {
    return PublicaApiInstance.get(`/documents/sign/${documentId}`, { responseType: "arraybuffer" });
  },
};

export default ApiService ;