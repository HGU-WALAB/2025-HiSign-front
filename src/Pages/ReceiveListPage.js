import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RejectButton from "../components/ListPage/RejectButton";
import { PageContainer } from "../components/PageContainer";
import ApiService from "../utils/ApiService";

const ReceivedDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        ApiService.fetchDocuments("received-with-requester")
            .then((response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);
                const sortedDocuments = filteredDocuments.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setDocuments(sortedDocuments);
                setTotalPages(Math.ceil(sortedDocuments.length / itemsPerPage));
            })
            .catch((error) => {
                console.error("문서 불러오기 오류:", error);
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, [itemsPerPage]);

    // 현재 페이지 데이터 가져오기
    const getCurrentPageData = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return documents.slice(indexOfFirstItem, indexOfLastItem);
    };

    // 상태 스타일 설정
    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: "#FFEB3B", color: "#000", border: "none" }, // 대기 중
            1: { backgroundColor: "#2196F3", color: "#fff", border: "none" }, // 완료
            2: { backgroundColor: "#F44336", color: "#fff", border: "none" }, // 거절됨
            3: { backgroundColor: "#FF9800", color: "#fff", border: "none" }, // 요청 취소됨
        };
        return statusStyles[status] || { backgroundColor: "#FFFFFF", color: "#000", border: "1px solid #ddd" };
    };

    // 상태 레이블 설정
    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "대기 중",
            1: "완료",
            2: "거절됨",
            3: "요청 취소됨",
        };
        return statusLabels[status] || "알 수 없음";
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1을 해줌
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 페이지 변경 함수
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    return (
        <PageContainer>
            <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                요청받은 문서 리스트
            </h1>
            {error && <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>{error}</p>}

            <table style={{
                borderCollapse: "collapse", // 경계선 충돌을 방지
                width: "100%",
                margin: "20px 0",
                fontFamily: "Arial, sans-serif",
                tableLayout: "fixed", // 셀 크기를 고정
                borderSpacing: "0", // 셀 간 간격 제거
            }}>
                <thead>
                <tr>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>작업명</th>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>파일명</th>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>요청 생성일</th>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>요청자</th>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>상태</th>
                    <th style={{ backgroundColor: "#86CFFA", color: "white", padding: "10px", textAlign: "center", fontWeight: "bold" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {getCurrentPageData().map((doc) => (
                    <tr key={doc.id}>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                            {doc.requestName}
                        </td>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                            <Link to={`/detail/${doc.id}`} style={{textDecoration: "none", color: "#2196F3"}}>
                                {doc.fileName}
                            </Link>
                        </td>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                            {formatDate(doc.createdAt)}
                        </td>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                            {doc.requesterName || "알 수 없음"}
                        </td>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                                <span
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        ...getStatusStyle(doc.status),
                                    }}
                                >
                                    {getStatusLabel(doc.status)}
                                </span>
                        </td>
                        <td style={{
                            padding: "10px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                            height: "50px"
                        }}>
                            {doc.status === 0 ? (
                                <RejectButton documentId={doc.id} status={doc.status} refreshDocuments={() => {
                                }}/>
                            ) : (
                                <button
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        cursor: "not-allowed",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        backgroundColor: "#ccc", // 비활성화된 버튼
                                        color: "#fff",
                                        border: "none",
                                    }}
                                    disabled
                                >
                                    거절됨
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 페이지 네이션 고정 */}
            <div style={{
                position: "fixed",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                zIndex: 10,
                backgroundColor: "white",
                padding: "10px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",
            }}>
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    style={{
                        margin: "0 5px",
                        padding: "10px 15px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    이전
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        style={{
                            margin: "0 5px",
                            padding: "10px 15px",
                            backgroundColor: currentPage === index + 1 ? "#2196F3" : "#fff",
                            color: currentPage === index + 1 ? "white" : "#4CAF50",
                            border: "1px solid #ddd",
                            cursor: "pointer"
                        }}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{ margin: "0 5px", padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
                >
                    다음
                </button>
            </div>
        </PageContainer>
    );
};

export default ReceivedDocuments;
