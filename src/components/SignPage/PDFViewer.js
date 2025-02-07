import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewer({ pdfUrl }) {
  const [totalPages, setTotalPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  return (
    <div>
      <Document
        file={pdfUrl}
        onLoadSuccess={(data) => setTotalPages(data.numPages)}
      >
        <Page pageNumber={pageNum} width={800} />
      </Document>
      <button onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}>이전</button>
      <span> Page {pageNum} / {totalPages} </span>
      <button onClick={() => setPageNum((prev) => Math.min(prev + 1, totalPages))}>다음</button>
    </div>
  );
}

export default PDFViewer;
