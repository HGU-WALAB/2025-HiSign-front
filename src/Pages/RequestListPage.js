import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { Modal, Box, Typography, Button, Pagination } from "@mui/material";
import { PageContainer } from "../components/PageContainer";
import CancelModal from "../components/ListPage/CancelModal";
import ApiService from "../utils/ApiService";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from "@mui/icons-material/ViewList";
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import moment from "moment/moment";

const RequestedDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [signers, setSigners] = useState([]);
    const [showSignersModal, setShowSignersModal] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [signerCounts, setSignerCounts] = useState({});


    const [searchQuery, setSearchQuery] = useState("");
    const [createdSortOrder, setCreatedSortOrder] = useState('desc');
    const [expiredSortOrder, setExpiredSortOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        ApiService.fetchDocuments("requested")
            .then(async (response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);
                const sortedDocuments = filteredDocuments.sort((a, b) => {
                    if (a.status === 0 && b.status !== 0) return -1;
                    else if (a.status !== 0 && b.status === 0) return 1;
                    else if (a.status === 0 && b.status === 0) return new Date(a.expiredAt) - new Date(b.expiredAt);
                    else return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setDocuments(sortedDocuments);

                const counts = {};
                await Promise.all(sortedDocuments.map(async (doc) => {
                    try {
                        const response = await ApiService.fetchSignersByDocument(doc.id);
                        const total = response.length;
                        const signed = response.filter(s => s.status === 1).length;
                        counts[doc.id] = `${signed}/${total}`;
                    } catch (e) {
                        counts[doc.id] = "0/0";
                    }
                }));

                setSignerCounts(counts);
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

    const getStatusClass = (status) => {
        const statusClasses = {
            0: "label label-info",
            1: "label label-success",
            2: "label label-danger",
            3: "label label-warning",
            4: "label label-default"
        };
        return statusClasses[status] || "badge bg-secondary";
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명중",
            1: "완료",
            2: "거절",
            3: "취소",
            4: "만료" };
        return statusLabels[status] || "알 수 없음";
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
            .catch(() => {
                alert("요청 취소에 실패했습니다.");
            });
    };

    const handleSearchClick = (docId) => {
        ApiService.fetchSignersByDocument(docId)
            .then((response) => {
                setSigners(response);
                setShowSignersModal(true);
            })
            .catch(() => {
                alert("서명자 정보를 불러오는데 실패했습니다.");
            });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const filteredDocuments = documents
        .filter(doc => doc.requestName.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(doc => {
            if (statusFilter === 'all') return true;
            return String(doc.status) === statusFilter;
        })
        .sort((a, b) => {
            if (createdSortOrder) {
                const result = new Date(b.createdAt) - new Date(a.createdAt);
                return createdSortOrder === 'desc' ? result : -result;
            } else if (expiredSortOrder) {
                const result = new Date(b.expiredAt) - new Date(a.expiredAt);
                return expiredSortOrder === 'desc' ? result : -result;
            }
            return 0;
        });

    const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <PageContainer>
            <h1 style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "bold",
                paddingTop: "1rem"
            }}>
                내작업
            </h1>

            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                maxWidth: "85%",
                margin: "0 auto 10px auto",
                padding: "0 8px",
                gap: "8px"
            }}
            >
                <div style={{display: "flex", alignItems: "center", gap: "6px", flex: "1 1 0"}}>
                    <select value={createdSortOrder || ''} onChange={(e) =>
                    { setCreatedSortOrder(e.target.value); setExpiredSortOrder(null); }}
                            style={{
                                padding: "4px 8px",
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: "14px",
                                minWidth: "80px",
                                height: "32px",
                                cursor: "pointer",
                    }}
                    >
                        <option value="">생성일</option>
                        <option value="desc">최신순</option>
                        <option value="asc">오래된순</option>
                    </select>
                    <select value={expiredSortOrder || ''} onChange={(e) =>
                    { setExpiredSortOrder(e.target.value); setCreatedSortOrder(null); }}
                            style={{
                                padding: "4px 8px",
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: "14px",
                                minWidth: "80px",
                                height: "32px",
                                cursor: "pointer",
                    }}
                    >
                        <option value="">만료일</option>
                        <option value="desc">최신순</option>
                        <option value="asc">오래된순</option>
                    </select>
                    <select value={statusFilter} onChange={(e) =>
                        setStatusFilter(e.target.value)}
                            style={{
                                padding: "4px 8px",
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: "14px",
                                minWidth: "80px",
                                height: "32px",
                                cursor: "pointer",
                    }}
                    >
                        <option value="all">문서 상태</option>
                        <option value="0">서명중</option>
                        <option value="1">완료</option>
                        <option value="2">거절</option>
                        <option value="3">취소</option>
                        <option value="4">만료</option>
                    </select>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "6px", flexShrink: 0}}>
                    <input type="text" placeholder="작업명 검색" value={searchQuery} onChange={handleSearchChange}
                           style={{
                               padding: "0.1rem",
                               width: "9rem"
                    }}
                    />
                    <button onClick={() => setViewMode("list")}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                    }}
                    >
                        <ViewListIcon color={viewMode === "list" ? "primary" : "disabled"}/>
                    </button>
                    <button onClick={() => setViewMode("grid")}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                    }}
                    >
                        <ViewModuleIcon color={viewMode === "grid" ? "primary" : "disabled"}/>
                    </button>
                </div>
            </div>

            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}

            {viewMode === "list" ? (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxWidth: "85%",
                    margin: "auto",
                    padding: "12px"
                }}>
                    {paginatedDocuments.map((doc, index) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div style={{flex: 1}}>
                                <div style={{fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center"}}>
                                    {doc.requestName}
                                    <button
                                        onClick={() => handleSearchClick(doc.id)}
                                        style={{
                                            marginLeft: "8px",
                                            padding: "2px 6px",
                                            border: "none",
                                            backgroundColor: "white",
                                            color: "#000000",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {signerCounts[doc.id] || ""}
                                    </button>
                                </div>
                                <div style={{marginTop: "6px"}}>
                                    상태: <span className={getStatusClass(doc.status)}>{getStatusLabel(doc.status)}</span>
                                </div>
                                <div style={{marginTop: "4px"}}>
                                    생성일: {moment(doc.createdAt).format('YYYY/MM/DD')}
                                </div>
                                <div style={{
                                    marginTop: "4px",
                                    color: doc.status === 0 && moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"
                                }}>
                                    만료일: {moment(doc.expiredAt).format('YYYY/MM/DD HH:mm')}
                                </div>
                            </div>

                            <div>
                                <Dropdown>
                                    <Dropdown.Toggle variant="light" style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        fontWeight: "bold",
                                        border: "none"
                                    }}>
                                        메뉴
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to={`/detail/${doc.id}`}>
                                            <FindInPageIcon fontSize="small" style={{marginRight: "6px"}} />
                                            문서 보기
                                        </Dropdown.Item>
                                        <Dropdown.Item disabled><DownloadIcon /> 다운로드</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleCancelClick(doc)} disabled={doc.status !== 0}>
                                            <CloseIcon /> 요청 취소
                                        </Dropdown.Item>
                                        <Dropdown.Item disabled><DeleteIcon /> 삭제</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                    maxWidth: "90%",
                    margin: "auto",
                    padding: "20px"
                }}>
                    {paginatedDocuments.map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                            transition: "0.3s",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <div>
                                <div style={{marginBottom: "8px", fontWeight: "bold"}}>{doc.requestName}</div>
                                <div><span className={getStatusClass(doc.status)}>{getStatusLabel(doc.status)}</span>
                                </div>
                                <div style={{margin: "6px 0"}}><strong>파일명:</strong> <Link
                                    to={`/detail/${doc.id}`}>{doc.fileName}</Link></div>
                                <div><strong>요청일:</strong> {moment(doc.createdAt).format('YY.MM.DD')}</div>
                                <div style={{color: moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"}}>
                                    <strong>만료일:</strong> {moment(doc.expiredAt).format('YY.MM.DD HH:mm')}</div>
                            </div>
                            <div style={{marginTop: "12px", display: "flex", justifyContent: "space-between"}}>
                                <Button variant="outlined" size="small" onClick={() => handleSearchClick(doc.id)}>🔍
                                    서명자</Button>
                                <Button variant="outlined" color="error" size="small" disabled={doc.status !== 0}
                                        onClick={() => handleCancelClick(doc)}>❌ 요청 거절</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CancelModal isVisible={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirmCancel}
                         cancelReason={cancelReason} setCancelReason={setCancelReason}/>

            <Modal open={showSignersModal} onClose={() => setShowSignersModal(false)}>

                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: "90%",
                    maxWidth: "600px",
                    minWidth: "280px",
                    borderRadius: "8px"
                }}>
                    <Typography variant="h6" component="h2" sx={{textAlign: "center"}}>서명자 정보</Typography>
                    <Box sx={{maxHeight: "300px", overflowY: "auto", mt: 2, p: 1}}>

                        {signers.length > 0 ? (
                            <ul>
                                {signers.map((signer, index) => (
                                    <li key={index}>
                                        {signer.name} ({signer.email}) -{" "}
                                        {signer.status === 1
                                            ? `서명 완료 (${moment(signer.signedAt).format("YYYY-MM-DD HH:mm")})`
                                            : "서명 전"}
                                    </li>
                                ))}
                            </ul>

                        ) : (
                            <Typography textAlign="center">서명자 정보가 없습니다.</Typography>
                        )}
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "flex-end", mt: 3}}>
                        <Button variant="contained" color="info" onClick={() => setShowSignersModal(false)}
                                sx={{width: "80px", height: "36px"}}>닫기</Button>
                    </Box>
                </Box>
            </Modal>
            {viewMode === "list" && (
                <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                    <Pagination count={Math.ceil(filteredDocuments.length / itemsPerPage)} color="default" page={currentPage}
                                onChange={handlePageChange}/>
                </div>
            )}
        </PageContainer>
    );
};

export default RequestedDocuments;
