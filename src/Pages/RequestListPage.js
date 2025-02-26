import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { PageContainer } from "../components/PageContainer";
import CancelModal from "../components/ListPage/CancelModal";
import ApiService from "../utils/ApiService";

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';



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
        return statusClasses[status] || "badge bg-secondary";
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
            <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold", paddingTop: "1rem" }}>
                요청한 작업
            </h1>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <div style={{ maxWidth: "85%", margin: "auto" }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0",
                    fontFamily: "Arial, sans-serif",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden"
                }}>
                    <thead>
                    <tr style={{
                        backgroundColor: "#FFFFFF",
                        color: "#333",
                        height: "45px",
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                        borderBottom: "1px solid #ddd"
                    }}>
                        <th style={{ padding: "12px" }}>상태</th>
                        <th style={{ padding: "12px" }}>작업명</th>
                        <th style={{ padding: "12px" }}>파일명</th>
                        <th style={{ padding: "12px" }}>요청 생성일</th>
                        <th style={{ padding: "12px" }}>추가메뉴</th>
                    </tr>
                    </thead>
                    <tbody>
                    {documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc, index) => (
                        <tr key={doc.id} style={{
                            borderBottom: "1px solid #ddd",
                            height: "50px",
                            backgroundColor: "white"
                        }}>
                            <td style={{ textAlign: "center" }}>
                                    <span className={getStatusClass(doc.status)}>
                                        {getStatusLabel(doc.status)}
                                    </span>
                            </td>
                            <td style={{ textAlign: "center" }}>{doc.requestName}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link to={`/detail/${doc.id}`} style={{ textDecoration: "none", color: "#007BFF" }}>
                                    {doc.fileName}
                                </Link>
                            </td>
                            <td style={{ textAlign: "center" }}>{doc.createdAt}</td>
                            <td style={{ textAlign: "center" }}>
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="light"
                                        style={{
                                            padding: "5px 10px",
                                            borderRadius: "5px",
                                            fontWeight: "bold",
                                            border: "none",
                                        }}
                                    >
                                        ⋮
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item disabled> <DownloadIcon/> 다운로드</Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() => handleCancelClick(doc)}
                                            className="text-muted"
                                            disabled={doc.status !== 0}
                                        >
                                            <CloseIcon/> 요청 취소
                                        </Dropdown.Item>
                                        <Dropdown.Item disabled> <DeleteIcon/> 삭제</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
