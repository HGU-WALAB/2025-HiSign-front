import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Document, Page } from 'react-pdf';
import { useRecoilState, useRecoilValue } from 'recoil';
import { documentState } from '../../recoil/atom/documentState'; // 문서 상태 가져오기
import { signerState } from '../../recoil/atom/signerState';

const AlignSign = () => {
    const [signersState] = useRecoilState(signerState); // 서명자 상태 가져오기
    const document = useRecoilValue(documentState); // 문서 상태 가져오기
    const [showOptions, setShowOptions] = useState(false); // 버튼 표시 상태 관리
    const [elements, setElements] = useState([]); // 서명 또는 텍스트 요소 관리
    const [currentElement, setCurrentElement] = useState(null); // 현재 선택된 요소 타입 (서명/텍스트)

    // 서명 추가 또는 텍스트 추가 버튼을 클릭했을 때의 처리
    const handleClick = (type) => {
        setCurrentElement(type); // 선택된 요소 타입을 설정
        setShowOptions(false); // 옵션 버튼 숨기기
    };

    // PDF 영역 클릭 시 위치에 서명 또는 텍스트 추가
    const handlePDFClick = (event) => {
        if (!currentElement) return; // 요소 타입이 없으면 아무 작업도 안 함

        const pdfContainer = event.target.getBoundingClientRect();
        const x = event.clientX - pdfContainer.left;
        const y = event.clientY - pdfContainer.top;

        const newElement = {
            id: Date.now(),
            type: currentElement,
            x,
            y,
            width: 100, // 기본 크기
            height: 30, // 기본 크기
            email: signersState[0]?.email || '', // 첫 번째 서명자의 이메일을 넣음
        };

        setElements([...elements, newElement]);
        setCurrentElement(null); // 요소 추가 후 타입 초기화
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* 사이드바 영역 */}
            <div style={{
                width: '25%',
                backgroundColor: '#E5F2FF', // 연한 파란색 배경
                padding: '20px',
                boxSizing: 'border-box',
                height: '100%',
                overflowY: 'auto',
                borderRight: '2px solid #D1D9E6' // 사이드바 구분선
            }}>
                <h2 style={{
                    fontSize: '1.2rem', // 타이틀 폰트 크기
                    fontWeight: 'bold',
                    color: '#1E4B84', // 제목 색상
                    marginBottom: '15px'
                }}>서명 인원</h2>
                {signersState.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {signersState.map((signer, index) => (
                            <div key={index} style={{
                                backgroundColor: '#FFFFFF', // 각 서명자 배경색
                                padding: '10px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // 박스 그림자
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ fontWeight: 'bold' }}>{signer.name}</p>
                                    <p style={{ color: '#888' }}>{signer.email}</p>
                                </div>
                                <button
                                    onClick={() => setShowOptions(!showOptions)} // 버튼 클릭 시 옵션 토글
                                    style={{
                                        backgroundColor: '#4CAF50', // 버튼 색상
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    +
                                </button>
                                {/* 옵션 버튼들이 보일 때만 나타나게 */}
                                {showOptions && (
                                    <div style={{ marginTop: '10px', marginLeft: '5px' }}>
                                        <button
                                            onClick={() => handleClick('signature')}
                                            style={{
                                                backgroundColor: 'white', // 하얀색 배경
                                                color: '#4CAF50', // 버튼 색상
                                                border: '2px solid #4CAF50', // 버튼 테두리
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                marginBottom: '5px',
                                                width: '100%'
                                            }}
                                        >
                                            서명 추가
                                        </button>
                                        <button
                                            onClick={() => handleClick('text')}
                                            style={{
                                                backgroundColor: 'white', // 하얀색 배경
                                                color: '#4CAF50', // 버튼 색상
                                                border: '2px solid #4CAF50', // 버튼 테두리
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}
                                        >
                                            텍스트 추가
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No signers added yet.</p>
                )}
            </div>

            {/* PDF 영역 */}
            <div
                style={{
                    width: '75%',
                    height: '100vh',  // 전체 화면을 채우도록 설정
                    backgroundColor: '#F9F9F9',  // 연한 회색 배경
                    padding: '20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',  // 가로로 중앙 정렬
                    alignItems: 'center',  // 세로로 중앙 정렬
                    overflow: 'hidden'
                }}
                onClick={handlePDFClick} // PDF 클릭 시 위치 지정
            >
                {document.fileUrl && (
                    <div style={{
                        maxWidth: '90%',
                        height: '91vh',
                        overflow: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        position: 'relative',
                    }}>
                        <Document file={document.fileUrl}>
                            <Page pageNumber={1} width={800} />
                        </Document>

                        {/* 추가된 서명/텍스트 요소 표시 */}
                        {elements.map((el) => (
                            <Draggable key={el.id}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: el.y,
                                        left: el.x,
                                        width: el.width,
                                        height: el.height,
                                        border: el.type === 'signature' ? '2px solid blue' : '2px solid red',
                                        cursor: 'move', // 드래그 커서
                                    }}
                                >
                                    {el.type === 'signature' ? '서명' : '텍스트'}
                                    {/* 서명자 이메일을 작은 텍스트로 표시 */}
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#888',
                                        marginTop: '10px',  // 이메일을 더 아래에 위치
                                    }}>
                                        {el.email}
                                    </div>
                                </div>
                            </Draggable>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlignSign;

