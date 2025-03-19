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
  // 서명 이미지 업로드
  uploadSignatureFile: async (blob,memberEmail) => { // -> unniqueID 이 아니라 이메일로 바꾸어야함 
    if (!blob) throw new Error('업로드할 서명 이미지가 없습니다.');
  
    const formData = new FormData();
    formData.append('file', blob, `${memberEmail}.png`); // Blob 데이터를 FormData에 추가
  
    try {
      const response = await PublicaApiInstance.post('/files/signature/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // 멀티파트 전송
      });
      return response.data.fileName; // 저장된 파일 이름 반환
    } catch (error) {
      console.error('서명 업로드 실패:', error);
      throw new Error(error.response?.data || '서명 업로드 중 오류 발생');
    }
  },

  // 문서 업로드
  uploadDocument: async (file, uniqueId,requestName,description,isRejectable) => {
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

  // 문서 목록 가져오기
  fetchDocuments: async (type) => {
    if (type === 'requested') {
      // 요청한 문서 리스트 API 호출
      return apiInstance.get('/documents/requested-documents');
    } else if (type === 'received') {
      // 요청받은 문서 리스트 API 호출
      return apiInstance.get('/documents/received-documents');
    } else if (type === 'received-with-requester') {
      return apiInstance.get('/documents/received-with-requester');
    } else {
      throw new Error('Invalid document type specified');
    }
  },

  fetchSignersByDocument: async (documentId) => {
    if (!documentId) throw new Error("문서 ID가 필요합니다.");
    return apiInstance.get(`/signature-requests/document/${documentId}/signers`)
        .then(response => response.data)
        .catch(error => {
          console.error("서명자 정보 가져오기 실패:", error);
          throw new Error("서명자 정보를 불러오는 중 오류가 발생했습니다.");
        });
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

  rejectDocument: async (documentId, reason) => {
    if (!documentId) throw new Error("문서 ID가 필요합니다.");
    if (!reason) throw new Error("거절 사유가 필요합니다.");

    return apiInstance.put(`/signature-requests/reject/${documentId}`, { reason });
  },

  // 서명 요청 전송
  sendSignatureRequest: async (documentId, memberName, signers) => {
    if (!documentId) throw new Error('문서 정보가 없습니다.');
    if (signers.length === 0) throw new Error('서명자를 추가해주세요.');
    if (!memberName) throw new Error('이름 정보가 없습니다. 다시 로그인해주세요.');

    const requestData = { documentId,memberName, signers };
    try {
      const response = await apiInstance.post("/signature-requests/request", requestData);
      return response;
    } catch (error) {
      if (error.response) {
          const errorMessage = error.response.data.message;
          alert(errorMessage); // 사용자에게 오류 메시지 표시
      } else {
          alert("서명 요청 중 알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    }
  },

  // 서명 요청 취소
  cancelSignatureRequest: async (documentId, reason) => {
    if (!documentId) throw new Error('문서 ID가 필요합니다.');
    if (!reason) throw new Error('취소 사유가 필요합니다.');

    return apiInstance.put(`/signature-requests/cancel/${documentId}`, { reason });
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
    if (!token) throw new Error("토큰이 없습니다.");

    try {
      const response = await PublicaApiInstance.get(`/signature-requests/check?token=${token}`);
      return response.data; // ✅ 정상 응답 반환 (200 OK)
    } catch (error) {
      console.error("서명 요청 토큰 검증 실패:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          throw new Error("❌ 잘못된 서명 요청입니다. 다시 확인해주세요."); // 404: 토큰이 존재하지 않음
        } else if (status === 401) {
          throw new Error("⚠️ 서명 요청이 만료되었습니다. 새로운 요청을 받아 진행하세요."); // 401: 만료된 요청
        } else if (status === 403) {
          // 403: 진행할 수 없는 상태 (이미 처리된 요청 등)
          if (typeof data === "object" && data.status !== undefined) {
            let errorMessage;
            switch (data.status) {
              case 1:
                errorMessage = "✅ 이미 완료된 서명 요청입니다. 추가 서명이 필요하지 않습니다.";
                break;
              case 2:
                errorMessage = "❌ 서명 요청이 거절되었습니다. 요청자에게 문의하세요.";
                break;
              case 3:
                errorMessage = "⚠️ 서명 요청이 취소되었습니다. 새로운 요청을 받아 진행하세요.";
                break;
              case 4:
                errorMessage = "⚠️ 서명 요청이 만료되었습니다. 다시 요청을 확인하세요.";
                break;
              case 5:
                errorMessage = "❌ 서명 요청이 삭제되었습니다. 진행할 수 없습니다.";
                break;
              default:
                errorMessage = "⚠️ 서명 요청을 진행할 수 없는 상태입니다.";
            }
            throw new Error(errorMessage);
          } else {
            throw new Error("⚠️ 서명 요청을 진행할 수 없는 상태입니다.");
          }
        }
      }

      throw new Error(error.response?.data || "⚠️ 서명 요청 검증 중 오류가 발생했습니다.");
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

  // 서명 저장 API 요청
  saveSignatures: async (documentId, signingData) => {
    if (!documentId || !signingData) {
      throw new Error('문서 ID와 서명자가 필요합니다.');
    }

    try {
      const response = await PublicaApiInstance.post(
        "/signature/sign",
        signingData,
        {
          params: { documentId },
        }
      );
      return response.data; // 성공 메시지 반환
    } catch (error) {
      console.error('서명 저장 실패:', error);
      throw new Error(error.response?.data || '서명 저장 중 오류 발생');
    }
  },
};

export default ApiService ;