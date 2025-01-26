import React from 'react';
import ApiService from '../../utils/ApiService'; // 실제 경로에 맞게 조정

const CancelButton = ({ documentId, backgroundColor = '#ff4d4f', refreshDocuments }) => {
  const handleCancel = async () => {
    if (!documentId) {
      alert('문서 ID가 유효하지 않습니다.');
      return;
    }

    const confirmCancel = window.confirm('서명 요청을 취소하시겠습니까?');
    if (!confirmCancel) return;

    try {
      const response = await ApiService.cancelSignatureRequest(documentId);
      alert(response.data);
      refreshDocuments();
    } catch (error) {
      alert('취소 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleCancel}
      style={{
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        backgroundColor: backgroundColor,
        color: '#fff',  // 텍스트 색상을 흰색으로 설정
        border: 'none', // 기본 보더 제거
      }}
    >
      요청 취소
    </button>
  );
};

export default CancelButton;
