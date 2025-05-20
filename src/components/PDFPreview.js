
import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

const PDFPreview = ({ fileUrl, height = 150 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const renderPDF = async () => {
            const loadingTask = pdfjsLib.getDocument(fileUrl);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });

            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            const scale = height / viewport.height;
            const scaledViewport = page.getViewport({ scale });

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            await page.render({
                canvasContext: context,
                viewport: scaledViewport,
            }).promise;
        };

        renderPDF().catch(err => {
            console.error("PDF 렌더링 실패:", err);
        });
    }, [fileUrl, height]);

    return <canvas ref={canvasRef} style={{ width: "100%", borderRadius: "6px" }} />;
};

export default PDFPreview;
