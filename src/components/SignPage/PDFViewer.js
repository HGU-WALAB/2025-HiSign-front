import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PagingControl from "../PagingControl";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewer({ pdfUrl, setCurrentPage }) {
  const [totalPages, setTotalPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  const handlePageChange = (newPage) => {
    setPageNum(newPage);
    setCurrentPage(newPage); // 현재 페이지 상태 업데이트
    console.log("현재 페이지:", newPage);
  };

  return (
    <>
      <div style={{ position: "relative", width: "802px", margin: "0 auto", border: "1px solid #999"}}>
        <Document
          file={pdfUrl}
          onLoadSuccess={(pdf) => setTotalPages(pdf.numPages)}
        >
          <Page pageNumber={pageNum} width={800} />
        </Document>
      </div>
      <PagingControl pageNum={pageNum} setPageNum={handlePageChange} totalPages={totalPages} />
    </>
  );
}

export default PDFViewer;