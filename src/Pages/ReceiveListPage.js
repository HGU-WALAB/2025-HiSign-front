import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DownloadIcon from "@mui/icons-material/Download";
import DrawIcon from "@mui/icons-material/Draw";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { Pagination } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import RejectModal from "../components/ListPage/RejectModal";
import { PageContainer } from "../components/PageContainer";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import ApiService from "../utils/ApiService";
import { downloadPDF } from "../utils/DownloadUtils";


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
    const [searchQuery, setSearchQuery] = useState("");
    const [createdSortOrder, setCreatedSortOrder] = useState("desc");
    const [expiredSortOrder, setExpiredSortOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
    const [loading, setLoading] = useState(false);


    //드롭다운 메뉴 반응형
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 1200);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        ApiService.fetchDocuments("received-with-requester")
            .then((response) => {
                const filteredDocuments = response.data.filter(
                    (doc) => doc.status !== 5
                );
                setDocuments(filteredDocuments);
            })
            .catch((error) => {
                console.error("문서 불러오기 오류:", error);
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, []);


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

    const handleRejectClick = (doc) => {
        setSelectedDocument(doc);
        setRejectReason("");
        setShowModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            alert("거절 사유를 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            await ApiService.rejectDocument(
                selectedDocument.id,
                rejectReason,
                selectedDocument.token,
                loginMember.email,
                loginMember.name
            );

            alert("요청이 거절되었습니다.");
            setShowModal(false);
            setDocuments((prevDocs) =>
                prevDocs.map((doc) =>
                    doc.id === selectedDocument.id ? { ...doc, status: 2 } : doc
                )
            );
        } catch (error) {
            console.error("요청 거절 중 오류 발생:", error);
            alert("요청 거절에 실패했습니다.");
        } finally {
            setLoading(false); // ✅ 로딩 종료
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const filteredDocuments = documents
        .filter((doc) =>
            doc.requestName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((doc) => {
            if (statusFilter === "all") return true;
            if (statusFilter === "rejected") return doc.status === 2 || doc.status === 6;
            return String(doc.status) === statusFilter;
        })
        .sort((a, b) => {
            if (createdSortOrder) {
                const result = new Date(b.createdAt) - new Date(a.createdAt);
                return createdSortOrder === "desc" ? result : -result;
            } else if (expiredSortOrder) {
                const result = new Date(b.expiredAt) - new Date(a.expiredAt);
                return expiredSortOrder === "desc" ? result : -result;
            }
            return 0;
        });

    const [openDropdownId, setOpenDropdownId] = useState(null); // 추가

    const toggleDropdown = (id) => {
        setOpenDropdownId((prevId) => (prevId === id ? null : id));
    };


    return (
        <PageContainer>
            <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", paddingTop: "1rem" }}>
                공유 작업
            </h1>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <div style={{
                display: "flex", justifyContent: "space-between", flexWrap: "wrap",
                maxWidth: "85%", margin: "0 auto 10px auto", padding: "0 8px", gap: "8px"
            }}>
                <div style={{ display: "flex", gap: "6px", flex: "1 1 0" }}>
                    <select value={createdSortOrder || ''} onChange={(e) => {
                        setCreatedSortOrder(e.target.value); setExpiredSortOrder(null);
                    }} style={{ minWidth: "80px", height: "32px", cursor: "pointer", border:"none"}}>
                        <option value="">생성일</option>
                        <option value="desc">최신순</option>
                        <option value="asc">오래된순</option>
                    </select>

                    <select value={expiredSortOrder || ''} onChange={(e) => {
                        setExpiredSortOrder(e.target.value); setCreatedSortOrder(null);
                    }} style={{ minWidth: "80px", height: "32px", cursor: "pointer" ,border:"none"}}>
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

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input type="text" placeholder="작업명 검색" value={searchQuery} onChange={handleSearchChange}
                           style={{ padding: "0.1rem", width: "9rem" }} />
                    <button onClick={() => setViewMode("list")} style={{ background: "none", border: "none" }}>
                        <ViewListIcon color={viewMode === "list" ? "primary" : "disabled"} />
                    </button>
                    <button onClick={() => setViewMode("grid")} style={{ background: "none", border: "none" }}>
                        <ViewModuleIcon color={viewMode === "grid" ? "primary" : "disabled"} />
                    </button>
                </div>
            </div>

            {viewMode === "list" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "85%", margin: "auto" }}>
                    {filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            minHeight: "8rem"
                        }}>
                            <div style={{flex: 1}}>
                                <div style={{fontWeight: "bold", color: "#000000"}}>{doc.requestName}</div>
                                <div style={{marginTop: "6px", color: "#000000"}}>상태: <StatusBadge status={doc.status}/></div>
                                <div style={{marginTop: "4px", color: "#000000"}}>생성일: {moment(doc.createdAt).format("YYYY/MM/DD")}</div>
                                <div style={{
                                    marginTop: "4px",
                                    color: doc.status === 0 && moment(doc.expiredAt).isSame(moment(), "day") ? "red" : "black"
                                }}>
                                    만료일: {moment(doc.expiredAt).format("YYYY/MM/DD HH:mm")}
                                </div>
                                <div style={{marginTop: "4px", color: "#000000"}}>요청자: {doc.requesterName || "알 수 없음"}</div>
                            </div>
                            <div style={{display: "flex", alignItems: "center"}}>
                                {isMobileView ? (
                                    <Dropdown style={{ position: "absolute", bottom: "12px", right: "12px" }}>
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
                                                        window.location.href = `/hisign/detail/${doc.id}`;
                                                        setOpenDropdownId(null); // 닫기
                                                    }}
                                                    style={iconButtonStyle}
                                                >
                                                    <FindInPageIcon fontSize="small" />
                                                    문서 보기
                                                </div>

                                                <Link
                                                    to={`/checkEmail?token=${doc.token}`}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color: doc.status !== 0 || doc.signStatus !== 0 ? "#aaa" : "#333",
                                                        pointerEvents: doc.status !== 0 || doc.signStatus !== 0 ? "none" : "auto",
                                                        textDecoration: "none",
                                                    }}
                                                    onClick={() => setOpenDropdownId(null)}  // 드롭다운 닫기
                                                    >
                                                    <DrawIcon fontSize="small" />
                                                    서명 하기
                                                </Link>

                                                <div
                                                    onClick={() => {
                                                        if (doc.status === 1) {
                                                            downloadPDF(doc.id);
                                                            setOpenDropdownId(null); // 닫기
                                                        }
                                                    }}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color: doc.status !== 1 ? "#aaa" : "#333",
                                                        pointerEvents: doc.status !== 1 ? "none" : "auto"
                                                    }}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                    다운로드
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        if (doc.status === 0 && doc.isRejectable === 1) {
                                                            handleRejectClick(doc);
                                                            setOpenDropdownId(null); // 닫기
                                                        }
                                                    }}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color:
                                                            doc.status !== 0 || doc.isRejectable !== 1 ? "#aaa" : "#333",
                                                        pointerEvents:
                                                            doc.status !== 0 || doc.isRejectable !== 1 ? "none" : "auto"
                                                    }}
                                                >
                                                    <DoDisturbIcon fontSize="small" />
                                                    요청 거절
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                            ApiService.deleteDocument(doc.id,'received')
                                                                .then(() => {
                                                                    alert("문서가 삭제되었습니다.");
                                                                    setDocuments((prevDocs) =>
                                                                        prevDocs.filter((d) => d.id !== doc.id)
                                                                    );
                                                                    setOpenDropdownId(null); // 닫기
                                                                })
                                                                .catch((err) => {
                                                                    console.error("문서 삭제 실패:", err);
                                                                    alert("문서 삭제에 실패했습니다.");
                                                                });
                                                        }
                                                    }}
                                                    style={{
                                                        ...iconButtonStyle,
                                                        color: "#dc3545"
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                    삭제
                                                </div>
                                            </div>
                                        )}
                                    </Dropdown>

                                ) : (
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "6px",
                                        position: "absolute",
                                        bottom: "12px",
                                        right: "12px"
                                    }}>
                                        <Link to={`/detail/${doc.id}`} style={{
                                        display: "flex", alignItems: "center", padding: "5px 10px",
                                        border: "1px solid #ccc", borderRadius: "5px",
                                        textDecoration: "none", color: "black"
                                    }}>
                                        <FindInPageIcon fontSize="small" style={{marginRight: "6px"}}/>
                                        문서 보기
                                    </Link>
                                        <Link to={`/checkEmail?token=${doc.token}`} style={{
                                            display: "flex", alignItems: "center", padding: "5px 10px",
                                            border: "1px solid #ccc", borderRadius: "5px",
                                            textDecoration: "none",
                                            color: (doc.status !== 0 || doc.signStatus !== 0)? "#aaa" : "#007bff",
                                            pointerEvents: (doc.status !== 0 || doc.signStatus !== 0)? "none" : "auto"
                                        }}>
                                            <DrawIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            서명 하기
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
                                            onClick={() => handleRejectClick(doc)}
                                            disabled={!(doc.status === 0 && doc.isRejectable === true && doc.signStatus === 0)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "5px 10px",
                                                border: "1px solid #ccc",
                                                borderRadius: "5px",
                                                backgroundColor: "transparent",
                                                color:
                                                doc.status === 0 && doc.isRejectable === true && doc.signStatus === 0
                                                    ? "#000000"
                                                    : "#aaa",
                                                pointerEvents:
                                                doc.status === 0 && doc.isRejectable === true && doc.signStatus === 0
                                                    ? "auto"
                                                    : "none",
                                            }}
                                            >
                                            <DoDisturbIcon fontSize="small" style={{ marginRight: "6px" }} />
                                            요청 거절
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("정말 이 문서를 삭제하시겠습니까?")) {
                                                    ApiService.deleteDocument(doc.id,'received')
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
                    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px", maxWidth: "85%", margin: "auto", padding: "20px"
                }}>
                {filteredDocuments.map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd", borderRadius: "8px", padding: "16px",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff"
                        }}>
                            <div style={{fontWeight: "bold", marginBottom: "8px"}}>{doc.requestName}</div>
                            <embed src={doc.previewUrl || doc.fileUrl} type="application/pdf" width="100%"
                                   height="150px"/>
                            <div style={{marginTop: "8px", fontSize: "14px"}}>
                                <StatusBadge status={doc.status}/><br/>
                                생성일: {moment(doc.createdAt).format("YY년 MM월 DD일")}<br/>
                                만료일: <span style={{
                                color: moment(doc.expiredAt).isSame(moment(), "day") ? "red" : "black"
                            }}>{moment(doc.expiredAt).format("YY년 MM월 DD일 HH:mm")}</span><br/>
                                요청자: {doc.requesterName || "알 수 없음"}
                            </div>
                            <div style={{marginTop: "10px", textAlign: "left"}}>
                                <button
                                    onClick={() => handleRejectClick(doc)}
                                    disabled={doc.status !== 0 || doc.isRejectable !== 1}
                                    style={{
                                        backgroundColor: "#f44336", color: "#fff", border: "none",
                                        padding: "6px 12px", borderRadius: "4px",
                                        cursor: doc.status !== 0 || doc.isRejectable !== 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    요청 거절
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === "list" && (
                <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                    <Pagination count={Math.ceil(filteredDocuments.length / itemsPerPage)} color="default"
                                page={currentPage} onChange={handlePageChange} style={{marginBottom: "1rem"}}/>
                </div>
            )}

            <RejectModal
                isVisible={showModal}
                loading={loading}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmReject}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                type={"reject"}
            />

            <FloatingCenterLink to="/tasksetup">
                <DrawIcon style={{fontSize: "32px"}}/>
            </FloatingCenterLink>
        </PageContainer>
    );
};

export default ReceivedDocuments;

const FloatingCenterLink = styled(Link)`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background-color: #87cefa;
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
        background-color: #4682b4;
    }
`;

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

