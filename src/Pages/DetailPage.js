import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';


const pdfjsWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const DetailPage = () => {
    const { documentId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/documents/${documentId}`, { responseType: 'arraybuffer' })
            .then((response) => {
                const fileBlob = new Blob([response.data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(fileBlob);
                setFileUrl(fileUrl);
            })
            .catch((error) => {
                setError('문서를 로드하는 중 오류가 발생했습니다: ' + error.message);
            });
    }, [documentId]);

    return (
        <div>
            {error && <p>{error}</p>}
            {fileUrl ? (
                <div style={{ height: '100vh', width: '100%' }}>
                    <Worker workerUrl={pdfjsWorkerUrl}>
                        <Viewer fileUrl={fileUrl} />
                    </Worker>
                </div>
            ) : (
                <p>로딩 중...</p>
            )}
        </div>
    );
};

export default DetailPage;

