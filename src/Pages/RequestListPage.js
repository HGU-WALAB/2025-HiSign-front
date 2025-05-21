import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DrawIcon from '@mui/icons-material/Draw';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { Box, Button, Modal, Pagination, Typography } from "@mui/material";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import CancelModal from "../components/ListPage/CancelModal";
import { PageContainer } from "../components/PageContainer";
import ApiService from "../utils/ApiService";
import { downloadPDF } from "../utils/DownloadUtils";


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
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);


    //드롭다운 메뉴 반응형
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 1200);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명중",
            1: "완료",
            2: "반려됨",
            3: "취소",
            4: "만료",
            6: "반려됨",
            7: "검토중",
        };
        return statusLabels[status] || "알 수 없음";
    };

    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: "#5ec9f3", color: "#fff" },  // 서명중
            1: { backgroundColor: "#2ecc71", color: "#fff" },  // 완료
            2: { backgroundColor: "#f5a623", color: "#fff" },  // 반려(선생님)
            3: { backgroundColor: "#f0625d", color: "#fff" },  // 취소
            4: { backgroundColor: "#555555", color: "#fff" },  // 만료
            6: { backgroundColor: "#f5a623", color: "#fff" },  // 반려(교수님)
            7: { backgroundColor: "#b6c3f2", color: "#fff" },  // 검토중
        };
        return statusStyles[status] || { backgroundColor: "#ccc", color: "#000" };
    };

    const StatusBadge = ({ status }) => {
        const label = getStatusLabel(status);
        const style = {
            ...getStatusStyle(status),
            borderRadius: "12px",
            padding: "2px 10px",
            fontSize: "13px",
            fontWeight: 600,
            display: "inline-block",
            whiteSpace: "nowrap",
            minWidth: "50px",
            textAlign: "center",
        };
        return <span style={style}>{label}</span>;
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
        .filter((doc) => {
            if (statusFilter === "all") return true;
            if (statusFilter === "rejected") return doc.status === 2 || doc.status === 6;
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

    const [openDropdownId, setOpenDropdownId] = useState(null); // 추가

    const toggleDropdown = (id) => {
        setOpenDropdownId((prevId) => (prevId === id ? null : id));
    };

    return (
        <PageContainer>
            <h1 style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "bold",
                paddingTop: "1rem"
            }}>
                내 작업
            </h1>

            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}


            <div style={{
                display: "flex", justifyContent: "space-between", flexWrap: "wrap",
                maxWidth: "85%", margin: "0 auto 10px auto", padding: "0 8px", gap: "8px"
            }}>
                <div style={{display: "flex", gap: "6px", flex: "1 1 0"}}>
                    <select value={createdSortOrder || ''} onChange={(e) => {
                        setCreatedSortOrder(e.target.value);
                        setExpiredSortOrder(null);
                    }} style={{minWidth: "80px", height: "32px", cursor: "pointer", border: "none"}}>
                        <option value="">생성일</option>
                        <option value="desc">최신순</option>
                        <option value="asc">오래된순</option>
                    </select>

                    <select value={expiredSortOrder || ''} onChange={(e) => {
                        setExpiredSortOrder(e.target.value);
                        setCreatedSortOrder(null);
                    }} style={{minWidth: "80px", height: "32px", cursor: "pointer", border: "none"}}>
                        <option value="">만료일</option>
                        <option value="desc">최신순</option>
                        <option value="asc">오래된순</option>
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
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
                        <option value="rejected">반려</option>
                        <option value="3">취소</option>
                        <option value="4">만료</option>
                        <option value="7">검토중</option>
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
                                <div style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    color: "#000000"
                                }}>
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
                                <div style={{marginTop: "6px",color: "#000000"}}>
                                    상태: <StatusBadge status={doc.status}/>
                                </div>
                                <div style={{marginTop: "4px", color: "#000000"}}>
                                    생성일: {moment(doc.createdAt).format('YYYY/MM/DD')}
                                </div>
                                <div style={{
                                    marginTop: "4px",
                                    color: doc.status === 0 && moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"
                                }}>
                                    만료일: {moment(doc.expiredAt).format('YYYY/MM/DD HH:mm')}
                                </div>
                            </div>

                            <div style={{display: "flex", alignItems: "center"}}>
                                {isMobileView ? (
                                    <div style={{position: "relative", marginTop: "12px"}}>
                                        <Dropdown style={{position: "relative", top: "35px", right: "-5px"}}>
                                            <Dropdown.Toggle
                                                variant="dark"
                                                onClick={() => toggleDropdown(doc.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    fontWeight: "bold",
                                                    border: "none",
                                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                메뉴
                                            </Dropdown.Toggle>

                                            {openDropdownId === doc.id && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        right: 0,
                                                        marginTop: "4px",
                                                        backgroundColor: "#fff",
                                                        border: "1px solid #ddd",
                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                        borderRadius: "8px",
                                                        zIndex: 2000,
                                                        width: "160px",
                                                        padding: "6px 0"
                                                    }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            window.location.href = `/detail/${doc.id}`;
                                                            setOpenDropdownId(null);
                                                        }}
                                                        style={iconButtonStyle}
                                                    >
                                                        <FindInPageIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                        문서 보기
                                                    </div>

                                                    <div
                                                        onClick={() => {
                                                            if (doc.status === 1) {
                                                                downloadPDF(doc.id);
                                                                setOpenDropdownId(null);
                                                            }
                                                        }}
                                                        style={{
                                                            ...iconButtonStyle,
                                                            color: doc.status !== 1 ? "#aaa" : "#333",
                                                            pointerEvents: doc.status !== 1 ? "none" : "auto"
                                                        }}
                                                    >
                                                        <DownloadIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                        다운로드
                                                    </div>

                                                    <div
                                                        onClick={() => {
                                                            if (doc.status === 0) {
                                                                handleCancelClick(doc);
                                                                setOpenDropdownId(null);
                                                            }
                                                        }}
                                                        style={{
                                                            ...iconButtonStyle,
                                                            color: doc.status !== 0 ? "#aaa" : "#333",
                                                            pointerEvents: doc.status !== 0 ? "none" : "auto"
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                        요청 취소
                                                    </div>

                                                    <div
                                                        onClick={() => {
                                                            if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                                ApiService.deleteDocument(doc.id)
                                                                    .then(() => {
                                                                        alert("문서가 삭제되었습니다.");
                                                                        setDocuments((prevDocs) =>
                                                                            prevDocs.filter((d) => d.id !== doc.id)
                                                                        );
                                                                        setOpenDropdownId(null);
                                                                    })
                                                                    .catch((err) => {
                                                                        console.error("문서 삭제 실패:", err);
                                                                        alert("문서 삭제에 실패했습니다.");
                                                                    });
                                                            }
                                                        }}
                                                        style={{...iconButtonStyle, color: "#dc3545"}}
                                                    >
                                                        <DeleteIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                        삭제
                                                    </div>
                                                </div>
                                            )}
                                        </Dropdown>
                                    </div>

                                ) : (
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: "6px",
                                        marginTop: "5rem"
                                    }}>
                                        <Link to={`/detail/${doc.id}`} style={{
                                            display: "flex", alignItems: "center", padding: "5px 10px",
                                            border: "1px solid #ccc", borderRadius: "5px",
                                            textDecoration: "none", color: "black"
                                        }}>
                                            <FindInPageIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            문서 보기
                                        </Link>
                                        <button
                                            onClick={() => downloadPDF(doc.id)}
                                            disabled={doc.status !== 1}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                textDecoration: "none",
                                                backgroundColor:
                                                    (doc.status !== 1)
                                                        ? "transparent"
                                                        : "white",
                                                color:
                                                    (doc.status !== 1)
                                                        ? "#aaa"
                                                        : "black",
                                                cursor:
                                                    (doc.status !== 1)
                                                        ? "not-allowed"
                                                        : "pointer"
                                            }}
                                        >
                                            <DownloadIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            다운로드
                                        </button>
                                        <button
                                            onClick={() => handleCancelClick(doc)}
                                            disabled={!(doc.status == 0 || doc.status == 7)}
                                            style={{
                                                display: "flex", alignItems: "center", padding: "5px 10px",
                                                border: "1px solid #ccc", borderRadius: "5px",
                                                backgroundColor: "transparent",
                                                color: !(doc.status == 0 || doc.status == 7) ? "#aaa" : "#000000",
                                                pointerEvents: !(doc.status == 0 || doc.status == 7) ? "none" : "auto"
                                            }}
                                        >
                                            <CloseIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            요청 취소
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                    ApiService.deleteDocument(doc.id)
                                                        .then(() => {
                                                            alert("문서가 삭제되었습니다.");
                                                            setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id));
                                                        })
                                                        .catch((err) => {
                                                            console.error("문서 삭제 실패:", err);
                                                            alert("문서 삭제에 실패했습니다.");
                                                        });
                                                }
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                backgroundColor: "transparent",
                                                color: "#dc3545",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            삭제
                                        </button>
                                    </div>
                                )}
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
                                <div>
                                    <StatusBadge status={doc.status}/>
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
                                        onClick={() => handleCancelClick(doc)}>❌ 요청 취소</Button>
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
                    <Pagination count={Math.ceil(filteredDocuments.length / itemsPerPage)} color="default"
                                page={currentPage}
                                onChange={handlePageChange}/>
                </div>
            )}

            <FloatingCenterLink to="/tasksetup">
                <DrawIcon style={{fontSize: "32px"}}/>
            </FloatingCenterLink>

        </PageContainer>

    );
};

export default RequestedDocuments;

const iconButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#333",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s",
};


const FloatingCenterLink = styled(Link)`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background-color: #87CEFA;
    color: white;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: background-color 0.3s ease-in-out;

    &:hover {
        background-color: #4682B4;
    }
`;

