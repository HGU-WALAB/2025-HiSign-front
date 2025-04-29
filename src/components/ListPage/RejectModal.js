import React from "react";
import { Modal } from "../../components/Modal";

const RejectModal = ({ isVisible, onClose, onConfirm, rejectReason, setRejectReason, type }) => {
    const actionLabel = type === "reject" ? "거절" : "반려"; // ✅ 타입에 따라 라벨 설정

    return (
        <Modal isVisible={isVisible} onClose={onClose} style={{ padding: "20px", width: "50%", textAlign: "center" }}>
            <h2>{actionLabel} 사유 입력</h2> {/* ✅ 제목도 동적으로 */}
            <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                    width: "100%",
                    height: "100px",
                    marginBottom: "10px",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                }}
                placeholder={`${actionLabel} 사유를 입력하세요`}
            />
            <br />
            <button
                onClick={onConfirm}
                style={{
                    backgroundColor: "#F44336",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginRight: "10px",
                    border: "none"
                }}
            >
                {actionLabel}
            </button>
            <button
                onClick={onClose}
                style={{
                    backgroundColor: "#ccc",
                    color: "#000",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    border: "none"
                }}
            >
                취소
            </button>
        </Modal>
    );
};

export default RejectModal;
