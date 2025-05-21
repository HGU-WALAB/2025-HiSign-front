import React from "react";

const RejectModal = ({ isVisible, onClose, onConfirm, rejectReason, setRejectReason, type }) => {
    if (!isVisible) return null;

    const actionLabel = type === "reject" ? "거절" : "반려"; // ✅ 타입에 따라 라벨 설정

    return (
        <div className="modal-overlay" style={styles.overlay}>
            <div className="modal-content" style={styles.content}>
                <div className="modal-header" style={styles.header}>
                    <h2 style={styles.headerText}>{actionLabel} 사유 입력</h2>
                </div>

                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={styles.textarea}
                    placeholder={`${actionLabel} 사유를 입력해주세요. `}
                />

                <div style={styles.footer}>
                    <button
                        onClick={onClose}
                        style={styles.cancelButton}
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        style={styles.confirmButton}
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    content: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        width: "80%",
        maxWidth: "600px",
        minWidth: "350px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
    },
    headerText: {
        fontSize: "20px",
        fontWeight: "bold",
        margin: 0,
    },
    textarea: {
        width: "100%",
        height: "150px",
        marginBottom: "20px",
        padding: "15px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        resize: "vertical",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "'Nanum Gothic', sans-serif",
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
    },
    confirmButton: {
        padding: "6px 12px",
        border: "1px solid #1976d2",
        backgroundColor: "#1976d2",
        color: "white",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.3s ease",
        minWidth: "90px",
    },
    cancelButton: {
        padding: "6px 12px",
        border: "1px solid #ccc",
        backgroundColor: "#ccc",
        color: "#000",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.3s ease",
        minWidth: "90px",
    },
};

export default RejectModal;
