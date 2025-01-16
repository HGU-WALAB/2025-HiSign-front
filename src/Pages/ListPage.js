import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/PageContainer';

export const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/documents/list')
            .then((response) => setDocuments(response.data))
            .catch((error) => {
                console.error('Error:', error.message);
                setError('문서를 불러오는 중 문제가 발생했습니다: ' + error.message);
            });
    }, []);

    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: '#FFEB3B', color: '#000', border: 'none' },
            1: { backgroundColor: '#2196F3', color: '#fff', border: 'none' },
            2: { backgroundColor: '#F44336', color: '#fff', border: 'none' },
            3: { backgroundColor: '#FF9800', color: '#fff', border: 'none' },
        };
        return statusStyles[status] || { backgroundColor: '#FFFFFF', color: '#000', border: '1px solid #ddd' };
    };

    const getStatusLabel = (status) => {
        const statusLabels = {
            0: '대기 중',
            1: '완료',
            2: '거절됨',
            3: '요청자 취소',
        };
        return statusLabels[status] || '알 수 없음';
    };

    const styles = {
        table: {
            borderCollapse: 'collapse',
            width: '100%',
            margin: '20px 0',
            fontFamily: 'Arial, sans-serif',
        },
        th: {
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
        },
        td: {
            padding: '10px',
            textAlign: 'center',
            borderBottom: '1px solid #ddd',
        },
        button: {
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'default',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        header: {
            textAlign: 'center',
            color: '#333',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
        },
        error: {
            color: 'red',
            textAlign: 'center',
            marginTop: '20px',
        },
    };

    return (
        <PageContainer>
            <h1 style={styles.header}>Document List</h1>
            {error && <p style={styles.error}>{error}</p>}
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>File Name</th>
                    <th style={styles.th}>Version</th>
                    <th style={styles.th}>Created At</th>
                    <th style={styles.th}>Updated At</th>
                    <th style={styles.th}>Status</th>
                </tr>
                </thead>
                <tbody>
                {documents.map((doc) => (
                    <tr key={doc.id}>
                        {console.log(doc)}
                        <td style={styles.td}>{doc.id}</td>
                        <td style={styles.td}>{doc.filePath.split('/').pop()}</td>
                        <td style={styles.td}>{doc.version}</td>
                        <td style={styles.td}>{doc.createdAt}</td>
                        <td style={styles.td}>{doc.updatedAt}</td>
                        <td style={styles.td}>
                            <span
                                style={{ ...styles.button, ...getStatusStyle(doc.status) }}
                            >
                                {getStatusLabel(doc.status)}
                            </span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </PageContainer>
    );
};

export default DocumentList;
