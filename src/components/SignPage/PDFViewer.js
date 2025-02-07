import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PagingControl from "../PagingControl";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewer({ pdfUrl }) {
  const [totalPages, setTotalPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);

  return (
    <>
      <div style={{ position: "relative", width: "800px", margin: "0 auto" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={(data) => setTotalPages(data.numPages)}
        >
          <Page pageNumber={pageNum} width={800} />
        </Document>
      </div>
      <PagingControl pageNum={pageNum} setPageNum={setPageNum} totalPages={totalPages} />
    </>
  );
}

export default PDFViewer;