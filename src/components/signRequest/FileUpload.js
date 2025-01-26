import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { documentState } from '../../recoil/atom/documentState';
import { memberState } from "../../recoil/atom/memberState";
import ApiService from '../../utils/ApiService';
import Drop from "../Drop";
import { PageContainer } from "../PageContainer";

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUpload = () => {
    const [file, setFile] = useRecoilState(documentState);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [document, setDocumentState] = useRecoilState(documentState); // 현재 PDF 파일
    const member = useRecoilValue(memberState); // 현재 사용자 정보
    const navigate = useNavigate();

    // 파일 업로드 처리
    const handleFileLoad = (file) => {
        ApiService.uploadDocument(file,member.unique_id)
            .then((response) => {
                alert("파일 업로드 완료!");
                console.log("Response Data:", response.data);
                
                const uploadedFile = file[0];
                if (!uploadedFile) {
                    alert("No file selected.");
                    return;
                }
        
                const blobUrl = URL.createObjectURL(uploadedFile);
                // 서버에서 받은 데이터를 상태에 저장 (예: id, name 등)
                setDocumentState({
                    id: response.data.id,
                    name: response.data.fileName,
                    fileUrl: blobUrl,
                });
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
                alert(`파일 업로드 실패: ${error.response?.data?.message || error.message}`);
            });
        setFileUrl(document.fileUrl);
    };

    // PDF 파일 로딩 성공 시 페이지 수 설정
    const handleLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // 파일 제거 처리
    const handleRemoveFile = () => {
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }
        setFile({ id: null, name: '', file: null, fileUrl: null });
        setFileUrl(null);
    };

    // 다음 단계로 이동
    const handleNextStep = () => {
        navigate("/add-signers");
    };

    return (
        <PageContainer>
            <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                {!file.file ? (
                    <Drop onLoaded={(files) => handleFileLoad(files)} />
                ) : (
                    <>
                        {fileUrl && (
                            <div style={{ height: "80vh", border: "1px solid #ddd", marginBottom: "20px", overflow: "auto" }}>
                                <Document file={fileUrl} onLoadSuccess={handleLoadSuccess}>
                                    {Array.from(new Array(numPages), (_, index) => (
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={800} />
                                    ))}
                                </Document>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                            <button
                                style={{ marginRight: "10px" }}
                                onClick={handleRemoveFile}
                            >
                                Choose Different File
                            </button>
                            <button onClick={handleNextStep}>Next Step</button>
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default FileUpload;

