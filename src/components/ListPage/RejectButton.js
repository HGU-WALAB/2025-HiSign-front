import React, { useState } from "react";
import ApiService from "../../utils/ApiService";

const RejectButton = ({ documentId, status, refreshDocuments }) => {
    const [isDisabled, setIsDisabled] = useState(status === 2);

    const handleReject = async () => {
        console.log("요청 거절 API 호출 - 문서 ID:", documentId); // 로그 추가

        if (!documentId) {
            alert("문서 ID가 유효하지 않습니다.");
            return;
        }

        const confirmReject = window.confirm("이 문서의 서명 요청을 거절하시겠습니까?");
        if (!confirmReject) return;

        try {
            const response = await ApiService.rejectSignatureRequest(documentId);
            alert(response.data || "서명 요청이 거절되었습니다.");
            setIsDisabled(true); // 버튼 비활성화
            refreshDocuments();
        } catch (error) {
            console.error("요청 거절 중 오류 발생:", error);
            alert(`요청 거절 중 오류가 발생했습니다: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    return (
        <button
            onClick={handleReject}
            disabled={isDisabled}
            style={{
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                backgroundColor: isDisabled ? "#ccc" : "#F44336",
                color: "#fff",
                border: "none",
            }}
        >
            {isDisabled ? "거절됨" : "요청 거절"}
        </button>
    );
};

export default RejectButton;