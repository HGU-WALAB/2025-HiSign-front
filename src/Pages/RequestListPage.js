import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown  } from "react-bootstrap";
import { Modal, Box, Typography, Button } from "@mui/material";
import { PageContainer } from "../components/PageContainer";
import CancelModal from "../components/ListPage/CancelModal";
import ApiService from "../utils/ApiService";
import { Pagination } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import moment from "moment/moment";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";

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
    const [signerCounts, setSignerCounts] = useState({});



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
            4: "label label-default",
        };
        return statusClasses[status] || "badge bg-secondary";
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: "서명중",
            1: "완료",
            2: "거절",
            3: "취소",
            4: "만료",
        };
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

    return (
        <PageContainer>
            <h1 style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: "bold",
                paddingTop: "2rem"
            }}>
                요청한 작업
            </h1>
            {error && <p style={{color: "red", textAlign: "center"}}>{error}</p>}

            <div style={{
                maxWidth: "85%",
                margin: "auto",
                boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff"
            }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
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

                        <th style={{padding: "12px"}}>No</th>
                        <th style={{padding: "12px", textAlign: "center", paddingRight: "6rem"}}>상태</th>
                        <th style={{padding: "12px 12px 12px 4px", textAlign: "left"}}>작업명</th>
                        <th style={{padding: "12px"}}>요청 생성일</th>
                        <th style={{padding: "12px"}}>요청 만료일</th>
                        <th style={{padding: "12px"}}>추가메뉴</th>
                    </tr>
                    </thead>
                    <tbody>
                    {documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc, index) => (
                        <tr key={doc.id} style={{
                            borderBottom: "1px solid #ddd",
                            height: "50px",
                            backgroundColor: "white",
                            transition: "all 0.2s ease-in-out",
                        }}>
                            <td style={{textAlign: "center", fontWeight: "bold"}}>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>

                            <td style={{textAlign: "center", paddingRight: "5rem"}}>
                                <span className={getStatusClass(doc.status)}
                                      style={{
                                          minWidth: "70px",
                                          display: "inline-block",
                                          textAlign: "center"
                                      }}
                                >
                                    {getStatusLabel(doc.status)}
                                </span>
                            </td>

                            <td style={{textAlign: "left", color: "black"}}>
                                {doc.requestName}
                                <button
                                    onClick={() => handleSearchClick(doc.id)}
                                    style={{
                                        backgroundColor: "white",
                                        marginLeft: "8px",
                                        padding: "2px 6px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                    }}
                                >
                                    {signerCounts[doc.id] || ""}
                                </button>
                            </td>

                            <td style={{
                                textAlign: "center",
                                color: "black",
                            }}>{moment(doc.createdAt).format('YYYY/MM/DD')}</td>
                            <td style={{
                                textAlign: "center",
                                color:
                                    doc.status === 0 && moment(doc.expiredAt).isSame(moment(), 'day')
                                        ? "red"
                                        : "black"
                            }}>
                                {moment(doc.expiredAt).format('YYYY/MM/DD HH:mm')}
                            </td>

                            <td style={{textAlign: "center"}}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="light" style={{
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        fontWeight: "bold",
                                        border: "none"
                                    }}></Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to={`/detail/${doc.id}`}>
                                            <DownloadIcon fontSize="small" style={{marginRight: "6px"}}/>
                                            문서 보기
                                        </Dropdown.Item>
                                        <Dropdown.Item disabled><DownloadIcon/> 다운로드</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleCancelClick(doc)}
                                                       disabled={doc.status !== 0}><DoDisturbIcon/> 요청
                                            거절</Dropdown.Item>
                                        <Dropdown.Item disabled><DeleteIcon/> 삭제</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                <Pagination count={Math.ceil(documents.length / itemsPerPage)} color="default" page={currentPage}
                            onChange={handlePageChange}/>
            </div>

            <CancelModal isVisible={showModal} onClose={() => setShowModal(false)} onConfirm={handleConfirmCancel}
                         cancelReason={cancelReason} setCancelReason={setCancelReason}/>


            <Modal open={showSignersModal} onClose={() => setShowSignersModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: "90%",
                    maxWidth: "430px",
                    minWidth: "280px",
                    borderRadius: "8px",
                }}>
                    <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
                        서명자 정보
                    </Typography>

                    <Box sx={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        mt: 2,
                        p: 1
                    }}>
                        {signers.length > 0 ? (
                            <ul>
                                {signers.map((signer, index) => (
                                    <li key={index}>
                                        {signer.name} ({signer.email}) - {signer.status === 1 ? "서명 완료" : "서명 전"}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Typography textAlign="center">서명자 정보가 없습니다.</Typography>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                        <Button
                            variant="contained"
                            color="info"
                            onClick={() => setShowSignersModal(false)}
                            sx={{ width: "80px", height: "36px" }}
                        >
                            닫기
                        </Button>
                    </Box>
                </Box>
            </Modal>



        </PageContainer>
    );
};

export default RequestedDocuments;

