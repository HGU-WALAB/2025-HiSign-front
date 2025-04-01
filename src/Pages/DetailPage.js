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
    const [error, setError] = useState(null);

    const toolbar = toolbarPlugin();

    useEffect(() => {
        ApiService.fetchDocument(documentId)
            .then(response => {
                const fileBlob = new Blob([response.data], { type: 'application/pdf' });
                setFileUrl(URL.createObjectURL(fileBlob));
            })
            .catch(error => {
                setError('문서를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });
    }, [documentId]);

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
            {fileUrl ? (
                <>
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
                                        <div style={{ padding: '0px 2px'}}>
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
    );
};

export default DetailPage;
