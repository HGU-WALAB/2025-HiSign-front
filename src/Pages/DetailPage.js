import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../utils/ApiService';
import { defaultColors } from './AllocatePage';

const pdfjsWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const DetailPage = () => {
    const { documentId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);
    const [documentInfo, setDocumentInfo] = useState(null);
    const [error, setError] = useState(null);
    const [signers, setSigners] = useState([]);

    const toolbar = toolbarPlugin();

    useEffect(() => {
        ApiService.fetchDocumentInfo(documentId)
            .then(response => {
                //console.log("Document Info:", response);
                setDocumentInfo(response.data);
            })
            .catch(error => {
                console.error("Error loading document info:", error);
                setError('문서 정보를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });

        ApiService.generateReviewDocument(documentId)
            .then(response => {
                const fileBlob = new Blob([response.data], { type: 'application/pdf' });
                setFileUrl(URL.createObjectURL(fileBlob));
            })
            .catch(error => {
                console.error("Error loading document:", error);
                setError('문서를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });

        ApiService.fetchSignersByDocument(documentId)
            .then((response) => {
                const signerList = response;
                const coloredSigners = signerList.map((signer, idx) => ({
                    ...signer,
                    color: defaultColors[idx % defaultColors.length]
                }));
                setSigners(coloredSigners);
            })
            .catch((error) => {
                console.error("서명자 정보 로딩 실패:", error);
                setError("서명자 정보를 로드하는 중 오류가 발생했습니다.");
            });
    }, [documentId]);

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
            6: { backgroundColor: "#f5a623", color: "#fff" },
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

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '24px',
            height: '100vh',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
        }}>
            {/* 문서 정보 영역 */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                maxWidth: '800px',
                width: '100%',
                margin: '0 auto',
                textAlign: 'left',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
            }}>

                {documentInfo && (
                    <div>
                        <p><strong>서명 요청자:</strong> {documentInfo.requesterName}</p>
                        <p><strong>상태:</strong> <StatusBadge status={documentInfo.status}/></p>
                        {documentInfo.status == 3 ? (
                        <p style={{ color: "#d9534f", fontWeight: "bold" }}>
                            <strong>취소 사유:</strong> {documentInfo.cancelReason || '없음'}
                        </p>
                        ) : null}
                        {(documentInfo.status == 2) ? (
                        <p style={{ color: "#f0ad4e", fontWeight: "bold" }}>
                            <strong>반려 사유:</strong> {documentInfo.reviewRejectReason || '없음'}
                        </p>
                        ) : null}
                        {(documentInfo.status == 6) ? (
                        <p style={{ color: "#f0ad4e", fontWeight: "bold" }}>
                            <strong>반려 사유:</strong> {documentInfo.rejectReason || '없음'}
                        </p>
                        ) : null}
                        <p><strong>서명 생성 시간:</strong> {new Date(documentInfo.createdAt).toLocaleString()}</p>
                        <p><strong>파일명:</strong> {documentInfo.fileName}</p>
                        <p><strong>작업명:</strong> {documentInfo.requestName}</p>
                    </div>
                )}
                <div style={{ marginTop: '10px' }}>
                    <p><strong>서명자 정보:</strong></p>
                    {signers.length > 0 ? (
                        signers.map((signer, idx) => (
                            <div key={signer.email} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 30px  0 0' }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        border: '1px solid #aaa',
                                        backgroundColor: signer.color
                                    }}
                                />
                                <span>{`서명자 ${idx + 1}: ${signer.name}`}</span>
                            </div>
                        ))
                    ) : (
                        <p>서명자 없음</p>
                    )}
                </div>
            </div>

            {/* 툴바 + PDF 영역 */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    width: '90vw',
                    maxWidth: '1000px',
                    minHeight: 'vh',
                    alignSelf: 'center',
                }}
            >
                {fileUrl ? (
                    <>
                        {/* 툴바 */}
                        <div style={{
                            padding: '6px 12px',
                            backgroundColor: '#f7f7f7',
                            borderBottom: '1px solid #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <toolbar.Toolbar>
                                {(props) => {
                                    const {
                                        ZoomOut,
                                        Zoom,
                                        ZoomIn,
                                        GoToPreviousPage,
                                        CurrentPageInput,
                                        GoToNextPage,
                                    } = props;
                                    return (
                                        <>
                                            <ZoomOut/>
                                            <Zoom/>
                                            <ZoomIn/>
                                            <GoToPreviousPage/>
                                            <CurrentPageInput/>
                                            <GoToNextPage/>
                                        </>
                                    );
                                }}
                            </toolbar.Toolbar>
                        </div>

                        {/* PDF 뷰어 */}
                        <div style={{flex: 1, overflow: 'auto'}}>
                            <Worker workerUrl={pdfjsWorkerUrl}>
                                <Viewer
                                    fileUrl={fileUrl}
                                    plugins={[toolbar]}
                                />
                            </Worker>
                        </div>
                    </>
                ) : (
                    <p style={{padding: '1rem'}}>로딩 중...</p>
                )}
            </div>
        </div>
    );
};

export default DetailPage;

