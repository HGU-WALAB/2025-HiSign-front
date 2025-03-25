import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Pagination } from "@mui/material";
import moment from 'moment';
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import RejectModal from "../components/ListPage/RejectModal";
import { PageContainer } from "../components/PageContainer";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import ApiService from "../utils/ApiService";

const ReceivedDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [loginMember] = useRecoilState(loginMemberState);

    useEffect(() => {
        ApiService.fetchDocuments("received-with-requester")
            .then((response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);

                const sortedDocuments = filteredDocuments.sort((a, b) => {
                    if (a.status === 0 && b.status !== 0) return -1;
                    if (a.status !== 0 && b.status === 0) return 1;
                    if (a.status === 0 && b.status === 0) {
                        return new Date(a.expiredAt) - new Date(b.expiredAt);
                    }
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setDocuments(sortedDocuments);
            })
            .catch((error) => {
                console.error("문서 불러오기 오류:", error);
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, []);

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

    const handleRejectClick = (doc) => {
        setSelectedDocument(doc);
        setRejectReason("");
        setShowModal(true);
    };

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            alert("거절 사유를 입력해주세요.");
            return;
        }

        ApiService.rejectDocument(selectedDocument.id, rejectReason, selectedDocument.token, loginMember.email)
            .then(() => {
                alert("요청이 거절되었습니다.");
                setShowModal(false);
                setDocuments((prevDocs) =>
                    prevDocs.map((doc) =>
                        doc.id === selectedDocument.id ? { ...doc, status: 2 } : doc
                    )
                );
            })
            .catch((error) => {
                console.error("요청 거절 중 오류 발생:", error);
                alert("요청 거절에 실패했습니다.");
            });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <PageContainer>
            <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold", paddingTop: "1rem" }}>
                요청받은 작업
            </h1>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "8%", marginBottom: "10px" }}>
                <button onClick={() => setViewMode("list")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <ViewListIcon color={viewMode === "list" ? "primary" : "disabled"} />
                </button>
                <button onClick={() => setViewMode("grid")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <ViewModuleIcon color={viewMode === "grid" ? "primary" : "disabled"} />
                </button>
            </div>

            {viewMode === "list" ? (
                <div style={{ maxWidth: "85%", margin: "auto", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                        <thead>
                        <tr style={{ backgroundColor: "#FFFFFF", color: "#333", height: "45px", textAlign: "center", fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                            <th style={{padding: "12px"}}>상태</th>
                            <th style={{padding: "12px"}}>작업명</th>
                            <th style={{padding: "12px"}}>파일명</th>
                            <th style={{padding: "12px"}}>요청 생성일</th>
                            <th style={{padding: "12px"}}>요청 만료일</th>
                            <th style={{padding: "12px"}}>요청자</th>
                            <th style={{padding: "12px"}}>추가메뉴</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                            <tr key={doc.id} style={{ borderBottom: "1px solid #ddd", height: "50px", backgroundColor: "white", transition: "all 0.2s ease-in-out" }}>
                                <td style={{textAlign: "center"}}><span className={getStatusClass(doc.status)}>{getStatusLabel(doc.status)}</span></td>
                                <td style={{textAlign: "center", color:"black"}}>{doc.requestName}</td>
                                <td style={{textAlign: "center"}}>
                                    <Link to={`/detail/${doc.id}`} style={{textDecoration: "none", color: "#007BFF"}}>{doc.fileName}</Link>
                                </td>
                                <td style={{textAlign: "center", color:"black"}}>{moment(doc.createdAt).format('YY년 MM월 DD일')}</td>
                                <td style={{textAlign: "center", color: moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black" }}>{moment(doc.expiredAt).format('YY년 MM월 DD일 HH:mm')}</td>
                                <td style={{textAlign: "center", color:"black"}}>{doc.requesterName || "알 수 없음"}</td>
                                <td style={{textAlign: "center"}}>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="light" style={{ padding: "5px 10px", borderRadius: "5px", fontWeight: "bold", border: "none" }}>⋮</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item disabled><DownloadIcon/> 다운로드</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleRejectClick(doc)} disabled={doc.status !== 0}><DoDisturbIcon/> 요청 거절</Dropdown.Item>
                                            <Dropdown.Item disabled><DeleteIcon/> 삭제</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", padding: "20px", maxWidth: "85%", margin: "auto" }}>
                    {documents.map((doc) => (
                        <div key={doc.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{doc.requestName}</div>
                            <div>
                                <Link to={`/detail/${doc.id}`} style={{ textDecoration: "none", color: "#007BFF" }}>{doc.fileName}</Link>
                            </div>
                            <div style={{ marginTop: "8px", fontSize: "14px" }}>
                                상태: <span className={getStatusClass(doc.status)}>{getStatusLabel(doc.status)}</span><br/>
                                생성일: {moment(doc.createdAt).format('YY년 MM월 DD일')}<br/>
                                만료일: <span style={{ color: moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black" }}>{moment(doc.expiredAt).format('YY년 MM월 DD일 HH:mm')}</span><br/>
                                요청자: {doc.requesterName || "알 수 없음"}
                            </div>
                            <div style={{ textAlign: "right", marginTop: "10px" }}>
                                <button onClick={() => handleRejectClick(doc)} disabled={doc.status !== 0} style={{ backgroundColor: "#f44336", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                                    요청 거절
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === "list" && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <Pagination count={Math.ceil(documents.length / itemsPerPage)} color="default" page={currentPage} onChange={handlePageChange} />
                </div>
            )}

            <RejectModal isVisible={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirmReject} rejectReason={rejectReason} setRejectReason={setRejectReason} />
        </PageContainer>
    );
};

export default ReceivedDocuments;