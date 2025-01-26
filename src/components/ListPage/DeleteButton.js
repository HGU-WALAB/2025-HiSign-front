import React from 'react';
import ApiService from '../../utils/ApiService';

const DeleteButton = ({ documentId, backgroundColor = '#F44336', refreshDocuments }) => {
  const handleDelete = async () => {
    if (!documentId) {
      alert('문서 ID가 유효하지 않습니다.');
      return;
    }

    const confirmDelete = window.confirm('정말로 이 문서를 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const responseMessage = await ApiService.deleteDocument(documentId);
      alert(responseMessage);
      if (refreshDocuments) {
        refreshDocuments(); // 문서 목록 갱신
      }
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      alert('문서 삭제에 실패했습니다.');
    }
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        backgroundColor: backgroundColor,
        color: '#fff',
        border: 'none',
      }}
    >
      삭제
    </button>
  );
};

export default DeleteButton;
