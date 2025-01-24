import { useRecoilState } from 'recoil';
import { documentState } from '../../recoil/atom/documentState';
import { useNavigate } from 'react-router-dom';
import Drop from "../Drop";
import { PageContainer } from "../PageContainer";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import {useState} from "react";

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUpload = () => {
    const [file, setFile] = useRecoilState(documentState);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const navigate = useNavigate();

    // 파일 업로드 처리
    const handleFileLoad = (files) => {
        const uploadedFile = files[0];
        if (!uploadedFile) {
            alert("No file selected.");
            return;
        }

        const blobUrl = URL.createObjectURL(uploadedFile);
        setFile({ ...file, file: uploadedFile, fileUrl: blobUrl });
        setFileUrl(blobUrl);
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

