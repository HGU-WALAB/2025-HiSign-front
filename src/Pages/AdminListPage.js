import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Pagination } from "@mui/material";
import { saveAs } from "file-saver";
import moment from 'moment';
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import * as XLSX from "xlsx";
import { PageContainer } from "../components/PageContainer";
import { loginMemberState } from "../recoil/atom/loginMemberState";
import ApiService from "../utils/ApiService";
import { downloadPDF, downloadZip } from "../utils/DownloadUtils";

const AdminDocuments = () => {
    const loginMember = useRecoilValue(loginMemberState);
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [createdSortOrder, setCreatedSortOrder] = useState('desc');
    const [expiredSortOrder, setExpiredSortOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 1200);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!loginMember) return;
        const role = loginMember.role?.trim().toUpperCase();
        if (role !== "ROLE_ADMIN") {
            alert("관리자만 접근 가능합니다.");
            navigate("/", { replace: true });
        }
    }, [loginMember, navigate]);

    useEffect(() => {
        if (!loginMember || loginMember.role?.trim().toUpperCase() !== "ROLE_ADMIN") return;

        ApiService.fetchDocuments("admin")
            .then((response) => {
                const filteredDocuments = response.data.filter(doc => doc.status !== 5);
                setDocuments(filteredDocuments);
            })
            .catch((error) => {
                console.error("문서 불러오기 오류:", error);
                setError("문서를 불러오는 중 문제가 발생했습니다: " + error.message);
            });
    }, [loginMember]);

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명중",
            1: "완료",
            2: "반려",
            3: "취소",
            4: "만료",
            6: "반려",
            7: "검토중",
        };
        return statusLabels[status] || "알 수 없음";
    };

    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: "#5ec9f3", color: "#fff" },
            1: { backgroundColor: "#2ecc71", color: "#fff" },
            2: { backgroundColor: "#f5a623", color: "#fff" },
            3: { backgroundColor: "#f0625d", color: "#fff" },
            4: { backgroundColor: "#555555", color: "#fff" },
            6: { backgroundColor: "#f78b2d", color: "#fff" },
            7: { backgroundColor: "#b6c3f2", color: "#fff" },
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

    const toggleSelectDoc = (doc) => {
        setSelectedDocs(prev =>
            prev.some(d => d.id === doc.id)
                ? prev.filter(d => d.id !== doc.id)
                : [...prev, doc]
        );
    };

    const areAllSelected = selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0;
    const toggleSelectAllDocs = () => {
        if (areAllSelected) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(filteredDocuments);
        }
    };

    const isDownloadable = selectedDocs.length > 0 && selectedDocs.every(doc => doc.status === 1);

    const handleExcelDownload = () => {
        const worksheetData = selectedDocs.map(doc => ({
            문서명: doc.requestName,
            상태: getStatusLabel(doc.status),
            요청생성일: moment(doc.createdAt).format("YYYY-MM-DD HH:mm"),
            요청만료일: moment(doc.expiredAt).format("YYYY-MM-DD HH:mm"),
            요청자: doc.requesterName || "알 수 없음"
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "문서 목록");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Ta근무일지.xlsx");
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
                관리자 문서
            </h1>

            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}

            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                maxWidth: "85%",
                margin: "0 auto 10px auto",
                padding: "0 8px",
                gap: "8px"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: "1 1 0"
                }}>
                    <select
                        value={createdSortOrder || ''}
                        onChange={(e) => {
                            setCreatedSortOrder(e.target.value);
                            setExpiredSortOrder(null);
                        }}
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

                    <select
                        value={expiredSortOrder || ''}
                        onChange={(e) => {
                            setExpiredSortOrder(e.target.value);
                            setCreatedSortOrder(null);
                        }}
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

                <button
                    onClick={handleExcelDownload}
                    style={{
                        padding: "6px 10px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "13px",
                        cursor: "pointer"
                    }}
                >
                    엑셀 다운로드
                </button>

                <button
                    onClick={() => downloadZip(selectedDocs.map(doc => doc.id))}
                    disabled={!isDownloadable}
                    style={{
                        padding: "6px 10px",
                        backgroundColor: !isDownloadable ? "#ccc" : "#007bff",
                        color: "#fff",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "13px",
                        cursor: !isDownloadable ? "not-allowed" : "pointer",
                        marginLeft: "8px"
                    }}
                >
                    일괄 다운로드
                </button>

                <div style={{display: "flex", alignItems: "center", gap: "6px", flexShrink: 0}}>
                    <input type="text" placeholder="작업명 검색" value={searchQuery} onChange={handleSearchChange}
                           style={{padding: "0.1rem", width: "9rem"}}/>
                    <button onClick={() => setViewMode("list")}
                            style={{background: "none", border: "none", cursor: "pointer"}}>
                        <ViewListIcon color={viewMode === "list" ? "primary" : "disabled"}/>
                    </button>
                    <button onClick={() => setViewMode("grid")}
                            style={{background: "none", border: "none", cursor: "pointer"}}>
                        <ViewModuleIcon color={viewMode === "grid" ? "primary" : "disabled"}/>
                    </button>
                </div>
            </div>

            <div style={{
                maxWidth: "85%",
                margin: "0 auto",
                padding: "0 11px",
            }}>
                <div style={{display: "flex", alignItems: "center", gap: "8px", paddingLeft: "15px", marginTop: "4px"}}>
                    <input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={toggleSelectAllDocs}
                        style={{transform: "scale(1.2)"}}
                    />
                    <label style={{fontSize: "0.9rem"}}>전체 선택</label>
                </div>
            </div>

            {viewMode === "list" ? (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxWidth: "85%",
                    margin: "auto",
                    padding: "12px"
                }}>
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
                            <input
                                type="checkbox"
                                checked={selectedDocs.some(d => d.id === doc.id)}
                                onChange={() => toggleSelectDoc(doc)}
                                style={{position: "absolute", top: "16px", left: "16px"}}
                            />

                            <div style={{flex: 1, paddingLeft: "36px", color: "#000000"}}>
                                <div style={{fontWeight: "bold",color: "#000000"}}>{doc.requestName}</div>
                                <div style={{marginTop: "6px", color: "#000000"}}>
                                    상태: <StatusBadge status={doc.status}/>
                                </div>
                                <div style={{marginTop: "4px",color: "#000000"}}>생성일: {moment(doc.createdAt).format('YYYY/MM/DD')}</div>
                                <div style={{
                                    marginTop: "4px",
                                    color: doc.status === 0 && moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"
                                }}>
                                    만료일: {moment(doc.expiredAt).format('YYYY/MM/DD HH:mm')}
                                </div>
                                <div style={{marginTop: "4px"}}>요청자: {doc.requesterName || "알 수 없음"}</div>
                            </div>


                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px'
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "8px",
                                    gap: "6px"
                                }}>
                                    <button
                                        onClick={() => navigate(`/check-task/${doc.id}`)}
                                        disabled={doc.status !== 7}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            padding: "4px 8px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            backgroundColor: doc.status === 7 ? "#007bff" : "transparent",
                                            color: doc.status === 7 ? "#fff" : "#aaa",
                                            fontSize: "0.8rem",
                                            fontWeight: "bold",
                                            cursor: doc.status === 7 ? "pointer" : "not-allowed",
                                            minWidth: "60px",
                                            maxWidth: "80px"
                                        }}
                                    >
                                        <SearchIcon fontSize="small"/>
                                        검토
                                    </button>
                                </div>
                                {window.innerWidth <= 1200 ? (
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            variant="dark"
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
                                        <Dropdown.Menu>
                                            <Dropdown.Item as={Link} to={`/detail/${doc.id}`}>
                                                <FindInPageIcon fontSize="small"
                                                                style={{marginRight: "6px", color: "#000000"}}/>문서 보기
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => downloadPDF(doc.id)}
                                                           disabled={doc.status !== 1}><DownloadIcon/> 다운로드
                                            </Dropdown.Item>
                                            <Dropdown.Item
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
                                                style={{color: "#000000", display: "flex", alignItems: "center"}}
                                            >
                                                <DeleteIcon fontSize="small" style={{marginRight: "6px"}}/>
                                                삭제
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                ) : (
                                    <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
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
                    padding: "20px",
                    maxWidth: "85%",
                    margin: "auto"
                }}>
                    {filteredDocuments.map((doc) => (
                        <div key={doc.id} style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <div style={{fontWeight: "bold", marginBottom: "8px"}}>{doc.requestName}</div>
                            <embed src={doc.previewUrl || doc.fileUrl} type="application/pdf" width="100%"
                                   height="150px"/>
                            <div style={{marginTop: "8px", fontSize: "14px"}}>
                                <StatusBadge status={doc.status}/>
                                생성일: {moment(doc.createdAt).format('YY년 MM월 DD일')}<br/>
                                만료일: <span
                                style={{color: moment(doc.expiredAt).isSame(moment(), 'day') ? "red" : "black"}}>{moment(doc.expiredAt).format('YY년 MM월 DD일 HH:mm')}</span><br/>
                                요청자: {doc.requesterName || "알 수 없음"}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === "list" && (
                <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                    <Pagination count={Math.ceil(filteredDocuments.length / itemsPerPage)} color="default"
                                page={currentPage} onChange={handlePageChange}/>
                </div>
            )}
        </PageContainer>
    );
};

export default AdminDocuments;


