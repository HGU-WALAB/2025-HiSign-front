import axios from 'axios';

// 📌 환경 변수
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const HISNET_LOGIN_URL = `${process.env.REACT_APP_HISNET_URL}/HisnetLogin/hisnet-login`;
const HISET_RETURN_URL = process.env.REACT_APP_HISET_RETURN_URL;
const HISNET_ACCESS_KEY = process.env.REACT_APP_HISNET_ACCESS_KEY;

// ✅ JWT 포함 인스턴스 (로그인된 사용자만 접근 가능)
const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ 공개 인스턴스 (비회원 / 서명자 접근 가능)
const PublicaApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 🔐 요청 시 JWT 토큰 자동 포함
apiInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 🔐 응답 시 401 처리
apiInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      alert('다시 로그인해 주세요.');
      sessionStorage.removeItem('token');
      window.location.href = '/hisign';
    }
    return Promise.reject(error);
  }
);

// ===================================================
// ✅ 로그인된 사용자 전용 API (apiInstance)
// ===================================================

const ApiService = {

  // 🔐 문서 업로드
  uploadDocument: async (file, uniqueId, requestName, description, isRejectable) => {
    if (!file) throw new Error('업로드할 파일이 없습니다.');
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('unique_id', uniqueId);
    formData.append('request_name', requestName);
    formData.append('description', description);
    formData.append('is_rejectable', isRejectable);

    return apiInstance.post('/files/document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 🔐 문서 목록 조회
  fetchDocuments: async (type) => {
    if (type === 'requested') return apiInstance.get('/documents/requested-documents');
    if (type === 'received') return apiInstance.get('/documents/received-documents');
    if (type === 'received-with-requester') return apiInstance.get('/documents/received-with-requester');
    throw new Error('Invalid document type specified');
  },

  // 🔐 문서별 서명자 목록 조회
  fetchSignersByDocument: async (documentId) => {
    if (!documentId) throw new Error("문서 ID가 필요합니다.");
    return apiInstance.get(`/signature-requests/document/${documentId}/signers`).then(res => res.data);
  },

  // 🔐 특정 문서(PDF) 다운로드
  fetchDocument: async (documentId) => {
    return apiInstance.get(`/documents/${documentId}`, { responseType: 'arraybuffer' });
  },

  // 🔐 문서 삭제
  deleteDocument: async (documentId) => {
    if (!documentId) throw new Error('문서 ID가 필요합니다.');
    return apiInstance.delete(`/documents/${documentId}`).then(res => res.data);
  },

  // 🔐 서명 요청 전송
  sendSignatureRequest: async (documentId, memberName, signers) => {
    if (!documentId) throw new Error('문서 정보가 없습니다.');
    if (signers.length === 0) throw new Error('서명자를 추가해주세요.');
    if (!memberName) throw new Error('이름 정보가 없습니다. 다시 로그인해주세요.');

    try {
      return await apiInstance.post("/signature-requests/request", {
        documentId,
        memberName,
        signers
      });
    } catch (error) {
      alert(error.response?.data?.message || "서명 요청 중 알 수 없는 오류가 발생했습니다.");
      throw error;
    }
  },

  // 🔐 서명 요청 취소
  cancelSignatureRequest: async (documentId, reason) => {
    if (!documentId) throw new Error('문서 ID가 필요합니다.');
    if (!reason) throw new Error('취소 사유가 필요합니다.');
    return apiInstance.put(`/signature-requests/cancel/${documentId}`, { reason });
  },
  
  // 🔐 서명자 검색
  searchSigners: async (query) => {
    return apiInstance.get(`/member/search?query=${query}`);
  },
  
  // ===================================================
  // ✅ 비로그인 상태에서도 사용 가능한 API (PublicaApiInstance)
  // ===================================================

  // 🌐 서명 이미지 업로드
  uploadSignatureFile: async (blob, memberEmail) => {
    if (!blob) throw new Error('업로드할 서명 이미지가 없습니다.');
    const formData = new FormData();
    formData.append('file', blob, `${memberEmail}.png`);
    const res = await PublicaApiInstance.post('/files/signature/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.fileName;
  },

  // 🌐 서명 요청 거절
  rejectDocument: async (documentId, reason, token, email) => {
    if (!documentId || !reason || !token || !email) throw new Error("필수 정보가 누락되었습니다.");
    return PublicaApiInstance.put(`/signature-requests/reject/${documentId}`, { reason, token, email });
  },

  // 🌐 서명 요청 토큰 유효성 확인
  checkSignatureToken: async (token) => {
    if (!token) return Promise.reject(new Error("❌ 토큰이 없습니다."));
    try {
      const res = await PublicaApiInstance.get(`/signature-requests/check?token=${token}`);
      return res.data;
    } catch (error) {
      const { status, data } = error.response || {};
      const messages = {
        400: "❌ 잘못된 요청 형식입니다.",
        404: "❌ 잘못된 서명 요청입니다.",
        410: "⚠️ 서명 요청이 만료되었습니다.",
        403: {
          1: "✅ 이미 완료된 서명 요청입니다.",
          2: "❌ 서명 요청이 거절되었습니다.",
          3: "⚠️ 서명 요청이 취소되었습니다.",
          4: "⚠️ 서명 요청이 만료되었습니다.",
          5: "❌ 서명 요청이 삭제되었습니다."
        },
        500: "🚨 서버 내부 오류가 발생했습니다."
      };

      if (status === 403 && typeof data === 'object') {
        return Promise.reject(new Error(messages[403][data.status] || "⚠️ 진행할 수 없는 상태입니다."));
      }
      return Promise.reject(new Error(messages[status] || data?.message || "⚠️ 오류가 발생했습니다."));
    }
  },

  // 🌐 서명 요청 검증 (이메일 입력 후)
  validateSignatureRequest: async (token, email) => {
    if (!token || !email) throw new Error('토큰과 이메일이 필요합니다.');
    const res = await PublicaApiInstance.post('/signature-requests/validate', { token, email });
    return res.data;
  },

  // 🌐 특정 문서의 서명 필드 조회
  fetchSignatureFields: async (documentId, signerEmail) => {
    return PublicaApiInstance.post(`/signature/fields`, { documentId, signerEmail });
  },

  // 🌐 서명 문서 불러오기
  fetchDocumentForSigning: async (documentId) => {
    return PublicaApiInstance.get(`/documents/sign/${documentId}`, { responseType: "arraybuffer" });
  },

  // 🌐 서명 저장 요청
  saveSignatures: async (documentId, signingData) => {
    if (!documentId || !signingData) throw new Error('문서 ID와 서명자가 필요합니다.');
    const res = await PublicaApiInstance.post(`/signature/sign`, signingData, {
      params: { documentId }
    });
    return res.data;
  },

  // ===================================================
  // 🔧 기타 (직접 요청 또는 리디렉션)
  // ===================================================

  // 🔧 히즈넷 로그인 요청 (리디렉션 방식)
  loginWithHisnet: () => {
    const url = `${HISNET_LOGIN_URL}?returnUrl=${encodeURIComponent(HISET_RETURN_URL)}&accessKey=${encodeURIComponent(HISNET_ACCESS_KEY)}`;
    window.location.href = url;
  },

  // 🔧 서버 로그인 요청
  login: async (hisnetToken) => {
    return axios.post(`${BASE_URL}/auth/login`, { hisnetToken }, {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
};

export default ApiService;
