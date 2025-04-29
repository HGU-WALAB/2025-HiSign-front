import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../utils/ApiService';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

const pdfjsWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const DetailPage = () => {
    const { documentId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);
    const [documentInfo, setDocumentInfo] = useState(null); // 문서 정보 상태
    const [error, setError] = useState(null);

    const toolbar = toolbarPlugin();

    useEffect(() => {
        // 문서 정보를 가져오는 API 호출
        ApiService.fetchDocumentInfo(documentId)
            .then(response => {
                setDocumentInfo(response.data); // 문서 정보 설정
            })
            .catch(error => {
                console.error("Error loading document info:", error);
                setError('문서 정보를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });

        // PDF 파일도 별도로 가져오기
        ApiService.fetchDocument(documentId)
            .then(response => {
                const fileBlob = new Blob([response.data], { type: 'application/pdf' });
                setFileUrl(URL.createObjectURL(fileBlob)); // PDF 파일 URL 설정
            })
            .catch(error => {
                console.error("Error loading document:", error);
                setError('문서를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });
    }, [documentId]);

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

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '70%',
            border: '1px solid #000',
            borderRadius: '5px',
            overflow: 'hidden',
            margin: '0 auto',
        }}>
            {error && <p>{error}</p>}
            <div style={{ flex: '0 0 auto', padding: '10px', backgroundColor: '#eeeeee', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                {/* 문서 정보 영역 */}
                {documentInfo && (
                    <div>
                        <p><strong>서명 요청자:</strong> {documentInfo.requesterName}</p>
                        <div style={{marginTop: "6px"}}>
                            상태: <span className={getStatusClass(documentInfo.status)}>{getStatusLabel(documentInfo.status)}</span>
                        </div>
                        <p><strong>취소/거절 사유:</strong> {documentInfo.rejectReason}</p>
                        <p><strong>서명 생성 시간:</strong> {new Date(documentInfo.createdAt).toLocaleString()}</p>
                        <p><strong>파일명:</strong> {documentInfo.fileName}</p>
                        <p><strong>작업명:</strong> {documentInfo.requestName}</p>
                    </div>
                )}
            </div>

            {/* PDF 파일 영역 */}
            <div style={{flex: 1, overflow: 'hidden', width: '100%'}}>
                {fileUrl ? (
                    <>
                        {/* 툴바 영역 */}
                        <div style={{
                            backgroundColor: '#eeeeee',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                            padding: '4px',
                            width: '100%',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
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
                                            <div style={{ padding: '0px 2px', marginLeft: "24rem" }}>
                                                <ZoomOut />
                                            </div>
                                            <div style={{ padding: '0px 2px' }}>
                                                <Zoom />
                                            </div>
                                            <div style={{ padding: '0px 2px' }}>
                                                <ZoomIn />
                                            </div>
                                            <div style={{ padding: '0px 2px' }}>
                                                <GoToPreviousPage />
                                            </div>
                                            <div style={{ padding: '0px 2px', width: "3rem" }}>
                                                <CurrentPageInput />
                                            </div>
                                            <div style={{ padding: '0px 2px' }}>
                                                <GoToNextPage />
                                            </div>
                                        </>
                                    );
                                }}
                            </toolbar.Toolbar>
                        </div>

                        {/* PDF 뷰어 영역 */}
                        <div style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                            <Worker workerUrl={pdfjsWorkerUrl}>
                                <Viewer fileUrl={fileUrl} plugins={[toolbar]} />
                            </Worker>
                        </div>
                    </>
                ) : (
                    <p>로딩 중...</p>
                )}
            </div>
        </div>
    );
};

export default DetailPage;
