import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { PageContainer } from "../components/PageContainer";
import CancelModal from "../components/ListPage/CancelModal";
import ApiService from "../utils/ApiService";

const RequestedDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
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
            })
            .catch((error) => {
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, []);

    const handleCancelClick = (doc) => {
        setSelectedDocument(doc);
        setCancelReason("");
        setShowModal(true);
    };

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

    const getStatusClass = (status) => {
        const statusClasses = {
            0: "label label-info",
            1: "label label-success",
            2: "label label-danger",
            3: "label label-warning",
            4: "label label-default",
        };
        return statusClasses[status] || "label label-default";
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명 진행 중",
            1: "완료",
            2: "거절됨",
            3: "취소됨",
            4: "만료됨",
        };
        return statusLabels[status] || "알 수 없음";
    };

    return (
        <PageContainer>
            <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                요청한 작업
            </h1>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
                <thead>
                <tr style={{
                    backgroundColor: "#86CFFA",
                    color: "white",
                    height: "45px",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: "bold"
                }}>
                    <th style={{ padding: "10px" }}>상태</th>
                    <th style={{ padding: "10px" }}>작업명</th>
                    <th style={{ padding: "10px" }}>파일명</th>
                    <th style={{ padding: "10px" }}>요청 생성일</th>
                    <th style={{ padding: "10px" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                    <tr key={doc.id}>
                        <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                                <span className={getStatusClass(doc.status)}>
                                    {getStatusLabel(doc.status)}
                                </span>
                        </td>
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
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="secondary"
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        fontWeight: "bold",
                                        border: "none",
                                    }}
                                >
                                    옵션
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item disabled>다운로드</Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => handleCancelClick(doc)}
                                        className="text-muted"
                                        disabled={doc.status !== 0}
                                    >
                                        요청 취소
                                    </Dropdown.Item>
                                    <Dropdown.Item disabled>삭제</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
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
