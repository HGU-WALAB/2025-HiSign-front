import React from "react";

const CancelModal = ({ isVisible, onClose, onConfirm, cancelReason, setCancelReason }) => {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay" style={styles.overlay}>
            <div className="modal-content" style={styles.content}>
                <div className="modal-header" style={styles.header}>
                    <h2 style={styles.headerText}>취소 사유 입력</h2>
                </div>

                <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={styles.textarea}
                    placeholder="취소 사유를 입력하세요"
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
                        확인
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
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        color: "#888",
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
        border: "1px solid #2566e8;",
        backgroundColor: "#2566e8;",
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
        backgroundColor: "#2566e8;",
        color: "#2566e8;",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.3s ease",
        minWidth: "90px",
    },
};

export default CancelModal;
