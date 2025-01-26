import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트 추가
import CancelButton from '../components/ListPage/CancelButton';
import DeleteButton from '../components/ListPage/DeleteButton';
import { PageContainer } from '../components/PageContainer';
import ApiService from '../utils/ApiService';

export const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지
    const [itemsPerPage] = useState(5);  // 페이지당 항목 수
    const [totalPages, setTotalPages] = useState(0);  // 총 페이지 수
    
    useEffect(() => {
        ApiService.fetchDocuments()
            .then(response => {
                console.log(response.data);
                setDocuments(response.data);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            })
            .catch(error => {
                console.error('Error:', error.message);
                setError('문서를 불러오는 중 문제가 발생했습니다: ' + error.message);
            });
    }, [itemsPerPage]);

    // 현재 페이지에 해당하는 데이터만 반환
    const getCurrentPageData = () => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return documents.slice(indexOfFirstItem, indexOfLastItem);
    };

    // 페이지 번호 클릭 시 페이지 변경
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 이전 페이지로 이동
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // 다음 페이지로 이동
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // 상태 스타일
    const getStatusStyle = (status) => {
        const statusStyles = {
            0: { backgroundColor: '#FFEB3B', color: '#000', border: 'none' },
            1: { backgroundColor: '#2196F3', color: '#fff', border: 'none' },
            2: { backgroundColor: '#F44336', color: '#fff', border: 'none' },
            3: { backgroundColor: '#FF9800', color: '#fff', border: 'none' },
        };
        return statusStyles[status] || { backgroundColor: '#FFFFFF', color: '#000', border: '1px solid #ddd' };
    };

    // 상태 레이블
    const getStatusLabel = (status) => {
        const statusLabels = {
            0: '대기 중',
            1: '완료',
            2: '거절됨',
            3: '요청 취소됨',
        };
        return statusLabels[status] || '알 수 없음';
    };
    
    //요청 취소시 다시 불러올 서버 문서목록
    const refreshDocuments = () => {
        ApiService.fetchDocuments()
            .then(response => {
                setDocuments(response.data);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            })
            .catch(error => {
                console.error('Error:', error.message);
                setError('문서를 불러오는 중 문제가 발생했습니다: ' + error.message);
            });
    };

    // 스타일
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
            cursor: 'pointer',
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
        pagination: {
            textAlign: 'center',
            marginTop: '20px',
        },
        pageButton: {
            margin: '0 5px',
            padding: '5px 10px',
            cursor: 'pointer',
        },
        navButton: {
            padding: '5px 10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: '#f1f1f1',
            border: '1px solid #ddd',
            margin: '0 5px',
        },
        disabledButton: {
            backgroundColor: '#e0e0e0',
            cursor: 'not-allowed',
        }
    };

    return (
        <PageContainer>
            <h1 style={styles.header}>Document List</h1>
            {error && <p style={styles.error}>{error}</p>}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>File Name</th>
                        <th style={styles.th}>Created At</th>
                        <th style={styles.th}>Updated At</th>
                        <th style={styles.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {getCurrentPageData().map((doc) => (
                        <tr key={doc.id}>
                            <td style={styles.td}>
                                <span style={{ ...styles.button, ...getStatusStyle(doc.status) }}>
                                    {getStatusLabel(doc.status)}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <Link to={`/detail/${doc.id}`} style={{ textDecoration: 'none', color: '#2196F3' }}>
                                    {doc.fileName}
                                </Link>
                            </td>
                            <td style={styles.td}>{doc.createdAt}</td>
                            <td style={styles.td}>{doc.updatedAt}</td>
                            <td style={styles.td}>
                            <span>
                                {doc.status === 0 ? (
                                    // 상태가 "대기 중"(0)일 경우 취소 버튼 표시
                                    <CancelButton documentId={doc.id} backgroundColor="#FF9800" refreshDocuments={refreshDocuments} />
                                ) : (
                                    // 그 외의 상태에서는 삭제 버튼 표시
                                    <DeleteButton documentId={doc.id} backgroundColor="#F44336" refreshDocuments={refreshDocuments} />
                                )}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이지네이션 버튼 */}
            <div style={styles.pagination}>
                <button
                    onClick={goToPreviousPage}
                    style={{
                        ...styles.navButton,
                        ...(currentPage === 1 ? styles.disabledButton : {}),
                    }}
                    disabled={currentPage === 1}
                >
                    {'<'}
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        style={{
                            ...styles.pageButton,
                            backgroundColor: currentPage === index + 1 ? '#4CAF50' : '#f1f1f1',
                            color: currentPage === index + 1 ? 'white' : 'black',
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={goToNextPage}
                    style={{
                        ...styles.navButton,
                        ...(currentPage === totalPages ? styles.disabledButton : {}),
                    }}
                    disabled={currentPage === totalPages}
                >
                    {'>'}
                </button>
            </div>
        </PageContainer>
    );
};

export default DocumentList;
