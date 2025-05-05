import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PagingControl from "../PagingControl";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewer({ pdfUrl, setCurrentPage, onScaleChange }) {
  const containerRef = useRef(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800); // ✅ 실제 PDF 표시 너비 상태

  useEffect(() => {
    const updateDimensions = (width) => {
      const newScale = width / 800;
      setContainerWidth(width);
      setScale(newScale);
      onScaleChange?.(newScale);
    };

    const observer = new ResizeObserver(([entry]) => {
      const newWidth = entry.contentRect.width;
      updateDimensions(newWidth);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      updateDimensions(containerRef.current.offsetWidth);
    }
  
    return () => observer.disconnect();
  }, [onScaleChange]);

  const handlePageChange = (newPage) => {
    setPageNum(newPage);
    setCurrentPage?.(newPage);
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={(pdf) => {
            setTotalPages(pdf.numPages);
          }}
        >
          <Page pageNumber={pageNum} width={containerWidth} />
        </Document>
      </div>
      <PagingControl pageNum={pageNum} setPageNum={handlePageChange} totalPages={totalPages} />
    </>
  );
}

export default PDFViewer;
