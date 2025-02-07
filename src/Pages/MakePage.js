// 필요한 라이브러리 및 컴포넌트 임포트
import dayjs from "dayjs"; // 날짜 처리 라이브러리
import { PDFDocument, rgb } from "pdf-lib"; // PDF 수정을 위한 라이브러리
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // PDF 처리를 위한 라이브러리
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
  const [pdf, setPdf] = useState(null); // 현재 PDF 파일
  const [autoDate, setAutoDate] = useState(true); // 자동 날짜 추가 여부
  const [signatureURL, setSignatureURL] = useState(null); // 서명 이미지 URL
  const [position, setPosition] = useState(null); // 서명/텍스트 위치
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false); // 서명 다이얼로그 표시 여부
  const [textInputVisible, setTextInputVisible] = useState(false); // 텍스트 입력 표시 여부
  const [pageNum, setPageNum] = useState(0); // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [pageDetails, setPageDetails] = useState(null); // 페이지 상세 정보
  const documentRef = useRef(null); // PDF 문서 요소 참조

  // const handlePostFiles = () => {
  //   if (window.confirm("추가하시겠습니까?")) {
  //     const formData = new FormData();
      
  //     // Blob URL을 Blob 객체로 변환
  //     fetch(pdf)
  //       .then(response => response.blob())  // Blob URL을 Blob 객체로 변환
  //       .then(blob => {
  //         // Blob 객체를 formData에 추가
  //         formData.append("file", blob, "file.pdf"); // 파일 이름은 "file.pdf"로 지정
  //         return axios.post("http://localhost:8080/api/file/document/upload", formData, {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });
  //       })
  //       .then((response) => {
  //         alert("등록 완료!");
  //         console.log(response);
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error.message);
  //       });
  //   }
  // };
  const handlePostFiles = (file) => {
    // if (!file) {
    //   alert("업로드할 파일이 없습니다.");
    //   return;
    // }
  
    // const formData = new FormData();
    // formData.append("file", file, file.name); // 파일 추가
  
    // axios
    //   .post("http://localhost:8080/api/files/document/upload", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   })
    //   .then((response) => {
    //     alert("파일 업로드 완료!");
    //     console.log("Response Data:", response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error uploading file:", error);
    //     alert(`파일 업로드 실패: ${error.response?.data?.message || error.message}`);
    //   });
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
            // 파일을 받아 Blob 객체로 저장
            // onLoaded={async (files) => {
            //   const URL = await blobToURL(files[0]);
            //   setPdf(URL);
            // }}
            // 파일 드롭 시 처리
            onLoaded={async (files) => {
              const file = files[0];
              if (file) {
                // 파일 업로드 함수 호출
                handlePostFiles(file);

                // Blob URL 생성 후 상태 업데이트
                const URL = await blobToURL(file);
                setPdf(URL); // 파일 URL 상태로 저장
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
                title={"날짜 추가"}
                onClick={() => setTextInputVisible("date")}
              />

              <BigButton
                marginRight={8}
                title={"텍스트 추가"}
                onClick={() => setTextInputVisible(true)}
              />

              {/* 초기화 버튼 */}
              <BigButton
                marginRight={8}
                title={"리셋"}
                onClick={() => {
                  setTextInputVisible(false);
                  setSignatureDialogVisible(false);
                  setSignatureURL(null);
                  setPdf(null);
                  setTotalPages(0);
                  setPageNum(0);
                  setPageDetails(null);
                }}
              />

              {/* 다운로드 버튼 */}
              {pdf ? (
                <BigButton
                  marginRight={8}
                  inverted={true}
                  title={"다운로드"}
                  onClick={() => {
                    downloadURI(pdf, "file.pdf"); // 다운 받아지는 파일 이름 생각해보기
                  }}
                />
              ) : null}
              {pdf ? (
                <BigButton onClick={handlePostFiles} title = {"추가"}></BigButton>
              ): ""
              }
            </div>

            {/* PDF 문서 표시 영역 */}
            <div ref={documentRef} style={styles.documentBlock}>
              {/* 텍스트 입력 컴포넌트 */}
              {textInputVisible ? (
                <DraggableText
                  initialText={
                    textInputVisible === "date"
                      ? dayjs().format("M/d/YYYY")
                      : null
                  }
                  onCancel={() => setTextInputVisible(false)}
                  onEnd={setPosition}
                  onSet={async (text) => {
                    // PDF 문서 크기에 맞게 텍스트 위치 조정
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

                    // 실제 PDF 문서 크기에 맞게 좌표 변환
                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    // PDF 수정
                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum];

                    // 텍스트 추가
                    firstPage.drawText(text, {
                      x: newX,
                      y: newY,
                      size: 20 * scale,
                    });

                    // 수정된 PDF 저장 및 상태 업데이트
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
                    // PDF 문서 크기에 맞게 서명 위치 조정
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

                    // 실제 PDF 문서 크기에 맞게 좌표 변환
                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    // PDF 수정
                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum];

                    // 서명 이미지 추가
                    const pngImage = await pdfDoc.embedPng(signatureURL);
                    const pngDims = pngImage.scale(scale * .3);

                    firstPage.drawImage(pngImage, {
                      x: newX,
                      y: newY,
                      width: pngDims.width,
                      height: pngDims.height,
                    });

                    // 자동 날짜 추가 옵션이 켜져있는 경우
                    if (autoDate) {
                      firstPage.drawText(
                        `Signed ${dayjs().format(
                          "M/d/YYYY HH:mm:ss ZZ"
                        )}`,
                        {
                          x: newX,
                          y: newY - 10,
                          size: 14 * scale,
                          color: rgb(0.074, 0.545, 0.262),
                        }
                      );
                    }

                    // 수정된 PDF 저장 및 상태 업데이트
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