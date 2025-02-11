// 필요한 라이브러리 및 컴포넌트 임포트
import { PDFDocument, rgb } from "pdf-lib";
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AddSigDialog } from "../components/AddSigDialog";
import { BigButton } from "../components/BigButton";
import DraggableSignature from "../components/DraggableSignature";
import DraggableText from "../components/DraggableText";
import Drop from "../components/Drop";
import { PageContainer } from "../components/PageContainer";
import PagingControl from "../components/PagingControl";
import { blobToURL } from "../utils/Utils";

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// PDF 파일 다운로드를 위한 유틸리티 함수
function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function App() {
  // 스타일 정의
  const styles = {
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    sigBlock: {
      display: "inline-block",
      border: "1px solid #000",
    },
    documentBlock: {
      maxWidth: 800,
      margin: "20px auto",
      marginTop: 8,
      border: "1px solid #999",
    },
    controls: {
      maxWidth: 800,
      margin: "0 auto",
      marginTop: 8,
    },
  };

  // 상태 관리
  const [pdf, setPdf] = useState(null);
  const [autoDate, setAutoDate] = useState(true);
  const [signatureURL, setSignatureURL] = useState(null);
  const [position, setPosition] = useState(null);
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const documentRef = useRef(null);

  // 리셋 함수 - PDF 파일은 유지하고 서명과 텍스트만 초기화
  const handleReset = async () => {
    if (pdf) {
      // 서명 관련 상태 초기화
      setTextInputVisible(false);
      setSignatureDialogVisible(false);
      setSignatureURL(null);
      setPosition(null);
      
      // PDF 파일의 원본 URL이 있다면 그것을 사용
      try {
        const response = await fetch(pdf);
        const blob = await response.blob();
        const URL = await blobToURL(blob);
        setPdf(URL);
      } catch (error) {
        console.error("Error resetting PDF:", error);
      }
    }
  };

  const handlePostFiles = (file) => {
    // API 연동 코드는 주석 처리
  };

  return (
    <PageContainer>
      <div style={styles.container}>
        {/* 서명 다이얼로그 컴포넌트 */}
        {signatureDialogVisible ? (
          <AddSigDialog
            autoDate={autoDate}
            setAutoDate={setAutoDate}
            onClose={() => setSignatureDialogVisible(false)}
            onConfirm={(url) => {
              setSignatureURL(url);
              setSignatureDialogVisible(false);
            }}
          />
        ) : null}

        {/* PDF 파일 드롭 영역 */}
        {!pdf ? (
          <Drop
            onLoaded={async (files) => {
              const file = files[0];
              if (file) {
                handlePostFiles(file);
                const URL = await blobToURL(file);
                setPdf(URL);
              }
            }}
          />
        ) : null}

        {/* PDF 뷰어 및 편집 영역 */}
        {pdf ? (
          <div>
            {/* 컨트롤 버튼들 */}
            <div style={styles.controls}>
              {!signatureURL ? (
                <BigButton
                  marginRight={8}
                  title={"서명 추가"}
                  onClick={() => setSignatureDialogVisible(true)}
                />
              ) : null}

              <BigButton
                marginRight={8}
                title={"텍스트 추가"}
                onClick={() => setTextInputVisible(true)}
              />

              {/* 수정된 리셋 버튼 */}
              <BigButton
                marginRight={8}
                title={"리셋"}
                onClick={handleReset}
              />

              {/* 다운로드 버튼 */}
              {pdf ? (
                <BigButton
                  marginRight={8}
                  inverted={true}
                  title={"다운로드"}
                  onClick={() => {
                    downloadURI(pdf, "file.pdf");
                  }}
                />
              ) : null}
              
              {pdf ? (
                <BigButton onClick={handlePostFiles} title={"추가"}></BigButton>
              ) : null}
            </div>

            {/* PDF 문서 표시 영역 */}
            <div ref={documentRef} style={styles.documentBlock}>
              {/* 텍스트 입력 컴포넌트 */}
              {textInputVisible ? (
                <DraggableText
                  onCancel={() => setTextInputVisible(false)}
                  onEnd={setPosition}
                  onSet={async (text) => {
                    const { originalHeight, originalWidth } = pageDetails;
                    const scale = originalWidth / documentRef.current.clientWidth;

                    const y =
                      documentRef.current.clientHeight -
                      (position.y +
                        (12 * scale) -
                        position.offsetY -
                        documentRef.current.offsetTop);
                    const x =
                      position.x -
                      166 -
                      position.offsetX -
                      documentRef.current.offsetLeft;

                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum];

                    firstPage.drawText(text, {
                      x: newX,
                      y: newY,
                      size: 20 * scale,
                    });

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([new Uint8Array(pdfBytes)]);
                    const URL = await blobToURL(blob);
                    setPdf(URL);
                    setPosition(null);
                    setTextInputVisible(false);
                  }}
                />
              ) : null}

              {/* 서명 컴포넌트 */}
              {signatureURL ? (
                <DraggableSignature
                  url={signatureURL}
                  onCancel={() => {
                    setSignatureURL(null);
                  }}
                  onSet={async () => {
                    const { originalHeight, originalWidth } = pageDetails;
                    const scale = originalWidth / documentRef.current.clientWidth;

                    const y =
                      documentRef.current.clientHeight -
                      (position.y -
                        position.offsetY +
                        64 -
                        documentRef.current.offsetTop);
                    const x =
                      position.x -
                      160 -
                      position.offsetX -
                      documentRef.current.offsetLeft;

                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum];

                    const pngImage = await pdfDoc.embedPng(signatureURL);
                    const pngDims = pngImage.scale(scale * .3);

                    firstPage.drawImage(pngImage, {
                      x: newX,
                      y: newY,
                      width: pngDims.width,
                      height: pngDims.height,
                    });

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([new Uint8Array(pdfBytes)]);
                    const URL = await blobToURL(blob);
                    setPdf(URL);
                    setPosition(null);
                    setSignatureURL(null);
                  }}
                  onEnd={setPosition}
                />
              ) : null}

              {/* PDF 문서 표시 */}
              <Document
                file={pdf}
                onLoadSuccess={(data) => {
                  setTotalPages(data.numPages);
                }}
              >
                <Page
                  pageNumber={pageNum + 1}
                  width={800}
                  height={1200}
                  onLoadSuccess={(data) => {
                    setPageDetails(data);
                  }}
                />
              </Document>
            </div>

            {/* 페이지 이동 컨트롤 */}
            <PagingControl
              pageNum={pageNum}
              setPageNum={setPageNum}
              totalPages={totalPages}
            />
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default App;