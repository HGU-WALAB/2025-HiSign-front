import { Drawer, List, ListItem, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from 'styled-components';
import CompleteButton from '../components/AlignPage/CompleteButton';
import { PageContainer } from "../components/PageContainer";
import PagingControl from "../components/PagingControl";
import { documentState } from "../recoil/atom/documentState";
import { signatureState } from "../recoil/atom/signatureState";
import { signerState } from "../recoil/atom/signerState";
import { blobToURL } from "../utils/Utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const AlignPage = () => {
  const styles = {
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    documentBlock: {
      maxWidth: 800,
      margin: "20px auto",
      border: "1px solid #999",
      position: "relative",
    },
    signatureBox: {
      border: "2px dashed #000",
      backgroundColor: "rgba(0,0,0,0.1)",
      cursor: "move",
      padding: "10px",
      textAlign: "center",
    },
  };

  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const document = useRecoilValue(documentState);
  const signers = useRecoilValue(signerState);
  const [signatureBoxes, setSignatureState] = useRecoilState(signatureState);
  const documentRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (document.file) {
        try {
          const pdfUrl = await blobToURL(document.file);
          setPdf(pdfUrl);
        } catch (error) {
          console.error("PDF 변환 중 오류 발생:", error);
        }
      }
    };
    loadPdf();
    console.log("Align doc: ", document);
    console.log("Align signers: ", signers);
  }, [document.file]);

  // 서명 박스 추가 함수
  const addSignatureBox = () => {
    if (!selectedSigner) return;

    setSignatureState((prevBoxes) => [
      ...prevBoxes,
      {
        type: 0,  // sign 타입 고정
        signerEmail: selectedSigner.email,
        width: 150,
        height: 50,
        position: {
          pageNumber: pageNum + 1,  // 현재 페이지 번호 반영
          x: 100,
          y: 150,
        },
      },
    ]);

    handleMenuClose();
  };

  // 서명자 드롭다운 핸들러
  const handleMenuClick = (event, signer) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSigner(signer);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <PageContainer>
      <div style={styles.container}>
        {/* 사이드바 서명자 목록 */}
        <Drawer variant="permanent" anchor="left">
          <Typography variant="h6" style={{ padding: 16 }}>서명 인원</Typography>
          <List>
            {signers.map((signer) => (
              <ListItem button key={signer.email} onClick={(e) => handleMenuClick(e, signer)}>
                <ListItemText primary={signer.name} secondary={signer.email} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
          <MenuItem onClick={addSignatureBox}>
            서명 추가
          </MenuItem>
        </Menu>

        {/* 문서 렌더링 */}
        {pdf ? (
          <div>
            <div style={styles.documentBlock} ref={documentRef}>
              <Document
                file={pdf}
                onLoadSuccess={(data) => setTotalPages(data.numPages)}
              >
                <Page
                  pageNumber={pageNum + 1}
                  width={800}
                />
              </Document>

              {/* 서명 박스 렌더링 (배열 기반으로 다수의 박스 표시) */}
              {signatureBoxes.length > 0 &&
                signatureBoxes
                  .filter((box) => box.position.pageNumber === pageNum + 1)  // 현재 페이지 필터링
                  .map((box, index) => (
                    <Rnd
                      key={box.signerEmail}  // 고유 키로 설정
                      bounds="parent"
                      size={{ width: box.width, height: box.height }}
                      position={{ x: box.position.x, y: box.position.y }}
                      enableResizing={{
                        top: true,
                        bottom: true,
                        left: true,
                        right: true,
                        topLeft: true,
                        topRight: true,
                        bottomLeft: true,
                        bottomRight: true,
                      }}
                      disableDragging={false}  // 드래그만 비활성화하지 않도록 설정
                      onDragStop={(e, d) => {
                        console.log(`align ${box.signerEmail} box moved:`, box);

                        setSignatureState((prevBoxes) =>
                          prevBoxes.map((b) =>
                            b.signerEmail === box.signerEmail
                              ? {
                                  ...b,
                                  position: { ...b.position, x: d.x, y: d.y }
                                }
                              : b
                          )
                        );
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        console.log(`align ${box.signerEmail} resized box:`, box);

                        setSignatureState((prevBoxes) =>
                          prevBoxes.map((b) =>
                            b.signerEmail === box.signerEmail
                              ? {
                                  ...b,
                                  width: ref.offsetWidth,
                                  height: ref.offsetHeight,
                                  position: { ...b.position, x: position.x, y: position.y },
                                }
                              : b
                          )
                        );
                      }}
                    >
                      <SignatureBoxContainer>
                        {box.signerEmail}의 서명
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`align ${box.signerEmail} box deleted.`);
                            setSignatureState((prevBoxes) =>
                              prevBoxes.filter((b) => b.signerEmail !== box.signerEmail)
                            );
                          }}
                        >
                          삭제
                        </DeleteButton>
                      </SignatureBoxContainer>
                    </Rnd>
                  ))}
            </div>
            <PagingControl
              pageNum={pageNum}
              setPageNum={setPageNum}
              totalPages={totalPages}
            />
          </div>
        ) : (
          <p>문서를 불러오는 중입니다...</p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <CompleteButton />
      </div>
    </PageContainer>
  );
};

export default AlignPage;

const SignatureBoxContainer = styled.div`
  position: relative;
  border: 2px dashed #000;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: move;
  padding: 10px;
  text-align: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  cursor: pointer;
  background-color: red;
  color: white;
  border: none;
  padding: 3px 6px;
  border-radius: 3px;
  z-index: 10; /* 다른 요소 위에 배치 */
`;