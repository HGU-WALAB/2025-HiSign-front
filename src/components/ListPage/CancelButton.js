import React from 'react';
import ApiService from '../../utils/ApiService'; // 실제 경로에 맞게 조정

const CancelButton = ({ documentId, backgroundColor = '#ff4d4f', refreshDocuments, setDocuments }) => {
    const handleCancel = async () => {
        //console.log("취소 요청할 문서 ID:", documentId); // 추가된 로그

        if (!documentId) {
            alert("문서 ID가 유효하지 않습니다.");
            return;
        }

        const confirmCancel = window.confirm("서명 요청을 취소하시겠습니까?");
        if (!confirmCancel) return;

        try {
            const response = await ApiService.cancelSignatureRequest(documentId);
            //console.log("API 응답:", response);

            // API 응답에서 message가 존재하는지 확인 후 alert 표시
            const successMessage = response.data?.message || "서명 요청이 취소되었습니다.";
            alert(successMessage);

            // 상태 즉시 변경하여 UI 업데이트
            if (setDocuments) {
                setDocuments((prevDocuments) =>
                    prevDocuments.map((doc) =>
                        doc.id === documentId ? { ...doc, status: 3 } : doc
                    )
                );
            }

            // 문서 목록 갱신
            refreshDocuments();
        } catch (error) {
            console.error("요청 취소 중 오류 발생:", error);

            const errorMessage = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
            alert(`취소 중 오류가 발생했습니다: ${errorMessage}`);
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
                color: '#fff',
                border: 'none',
            }}
        >
            요청 취소
        </button>
    );
};

export default CancelButton;