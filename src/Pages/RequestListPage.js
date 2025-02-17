import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../components/PageContainer";
import CancelModal from "../components/ListPage/CancelModal";
import ApiService from "../utils/ApiService";

const RequestedDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        ApiService.fetchDocuments("requested")
            .then((response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);
                const sortedDocuments = filteredDocuments.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setDocuments(sortedDocuments);
                setTotalPages(Math.ceil(sortedDocuments.length / itemsPerPage));
            })
            .catch((error) => {
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, [itemsPerPage]);

    // 요청 취소 버튼 클릭 시 모달 열기
    const handleCancelClick = (doc) => {
        setSelectedDocument(doc);
        setCancelReason("");
        setShowModal(true);
    };

    // 요청 취소 API 호출
    const handleConfirmCancel = () => {
        if (!cancelReason.trim()) {
            alert("취소 사유를 입력해주세요.");
            return;
        }

        ApiService.cancelSignatureRequest(selectedDocument.id, cancelReason)
            .then(() => {
                alert("요청이 취소되었습니다.");
                setShowModal(false);
                setDocuments((prevDocs) =>
                    prevDocs.map((doc) =>
                        doc.id === selectedDocument.id ? { ...doc, status: 3 } : doc
                    )
                );
            })
            .catch((error) => {
                console.error("요청 취소 중 오류 발생:", error);
                alert("요청 취소에 실패했습니다.");
            });
    };

    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: "#FFEB3B", color: "#000", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" },
            1: { backgroundColor: "#2196F3", color: "#fff", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" },
            2: { backgroundColor: "#F44336", color: "#fff", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" },
            3: { backgroundColor: "#FF9800", color: "#fff", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" },
        };
        return statusStyles[status] || { backgroundColor: "#FFFFFF", color: "#000", border: "1px solid #ddd" };
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "대기 중",
            1: "완료",
            2: "거절됨",
            3: "요청 취소됨",
        };
        return statusLabels[status] || "알 수 없음";
    };

    return (
        <PageContainer>
            <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                요청한 문서 리스트
            </h1>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
                <thead>
                <tr style={{ backgroundColor: "#86CFFA", color: "white", height: "45px", textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>
                    <th style={{ padding: "10px" }}>작업명</th>
                    <th style={{ padding: "10px" }}>파일명</th>
                    <th style={{ padding: "10px" }}>요청 생성일</th>
                    <th style={{ padding: "10px" }}>상태</th>
                    <th style={{ padding: "10px" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                    <tr key={doc.id}>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                            {doc.requestName}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                            <Link to={`/detail/${doc.id}`} style={{ textDecoration: "none", color: "#2196F3" }}>
                                {doc.fileName}
                            </Link>
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                            {doc.createdAt}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                            <span style={getStatusStyle(doc.status)}>
                                {getStatusLabel(doc.status)}
                            </span>
                        </td>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                            {doc.status === 0 ? (
                                <button
                                    onClick={() => handleCancelClick(doc)}
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        backgroundColor: "#F44336",
                                        color: "#fff",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    요청 취소
                                </button>
                            ) : (
                                <button
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        backgroundColor: "#ccc",
                                        color: "#fff",
                                        border: "none",
                                        fontWeight: "bold",
                                    }}
                                    disabled
                                >
                                    취소됨
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <CancelModal
                isVisible={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmCancel}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
            />
        </PageContainer>
    );
};

export default RequestedDocuments;
