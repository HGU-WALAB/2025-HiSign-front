import { Drawer, List, ListItem, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from 'styled-components';
import CompleteButton from '../components/AlignPage/CompleteButton';
import PagingControl from "../components/PagingControl";
import { documentState } from "../recoil/atom/documentState";
import { signerState } from "../recoil/atom/signerState";
import SignatureService from "../utils/SignatureService";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const AlignPage = () => {
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const document = useRecoilValue(documentState);
  const [signers, setSigners] = useRecoilState(signerState);
  const documentRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);

  useEffect(() => {
    if (document.fileUrl) {
      setPdf(document.fileUrl);
    }
  }, [document.fileUrl]);

  const addSignatureBox = () => {
    if (!selectedSigner) return;
    SignatureService.addSignatureBox(signers, setSigners, selectedSigner.email, pageNum);
    handleMenuClose();
  };

  const handleMenuClick = (event, signer) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSigner(signer);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  useEffect(() => {
    console.log("Updated signers state:", signers);
  }, [signers]);

  return (
    <MainContainer>
      <ContentWrapper>
        <Container>
          <StyledDrawer variant="permanent" anchor="left">
            <DrawerHeader>
              <StyledTitle variant="h6">서명 인원</StyledTitle>
              <Divider />
              <StyledServTitle variant="h7">대상을 선택후 위치를 지정하세요</StyledServTitle>
              <Divider />
            </DrawerHeader>
            <List>
              {signers.map((signer) => (
                <ListItem button key={signer.email} onClick={(e) => handleMenuClick(e, signer)}>
                  <ListItemText primary={signer.name} secondary={signer.email} />
                </ListItem>
              ))}
            </List>
          </StyledDrawer>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={addSignatureBox}>서명 추가</MenuItem>
          </Menu>

          <DocumentSection>
            {pdf ? (
              <DocumentContainer ref={documentRef}>
                <Document file={pdf} onLoadSuccess={(data) => setTotalPages(data.numPages)}>
                  <Page pageNumber={pageNum + 1} width={800} />
                </Document>

                {signers.length > 0 &&
                  signers.map((signer) =>
                    signer.signatureFields
                      .map((box, originalIndex) => ({ ...box, originalIndex }))
                      .filter((box) => box.position.pageNumber === pageNum + 1)
                      .map(({ width, height, position, originalIndex }) => (
                        <Rnd
                          key={`${signer.email}-${originalIndex}`}
                          bounds="parent"
                          size={{ width, height }}
                          position={{ x: position.x, y: position.y }}
                          onDragStop={(e, d) => {
                            SignatureService.updateSignaturePosition(
                              signers,
                              setSigners,
                              signer.email,
                              originalIndex,
                              { x: d.x, y: d.y }
                            );
                            setTimeout(() => {
                              const updatedSigner = signers.find((s) => s.email === signer.email);
                              const updatedBox = updatedSigner?.signatureFields[originalIndex];
                              console.log("Updated position to:", {
                                name: updatedSigner?.name,
                                page: updatedBox?.position.pageNumber,
                                x: updatedBox?.position.x,
                                y: updatedBox?.position.y
                              });
                            }, 0);
                          }}
                          onResizeStop={(e, direction, ref, delta, pos) => {
                            SignatureService.updateSignatureSize(
                              signers,
                              setSigners,
                              signer.email,
                              originalIndex,
                              ref.offsetWidth,
                              ref.offsetHeight,
                              pos
                            );
                            setTimeout(() => {
                              const updatedSigner = signers.find((s) => s.email === signer.email);
                              const updatedBox = updatedSigner?.signatureFields[originalIndex];
                              console.log("Updated size to:", {
                                name: updatedSigner?.name,
                                page: updatedBox?.position.pageNumber,
                                width: updatedBox?.width,
                                height: updatedBox?.height
                              });
                            }, 0);
                          }}
                        >
                          <SignatureBoxContainer>
                            {signer.name}의 서명
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                SignatureService.removeSignatureBox(signers, setSigners, signer.email, originalIndex);
                              }}
                            >
                              삭제
                            </DeleteButton>
                          </SignatureBoxContainer>
                        </Rnd>
                      ))
                  )}
              </DocumentContainer>
            ) : (
              <LoadingMessage>문서를 불러오는 중입니다...</LoadingMessage>
            )}

            <PagingControl pageNum={pageNum} setPageNum={setPageNum} totalPages={totalPages} />
          </DocumentSection>
        </Container>

        <ButtonContainer>
          <CompleteButton />
        </ButtonContainer>
      </ContentWrapper>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-top: 80px; // 헤더바 높이만큼 마진 추가
`;

const Container = styled.div`
  margin: 0 auto;
  padding: 20px;
  position: relative;
`;

const DocumentSection = styled.div`
  margin-left: 250px;
  padding: 20px;
`;

const DrawerHeader = styled.div`
  padding: 16px;
`;

const Divider = styled.hr`
  margin: 10px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
  width: 100%;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const DocumentContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #999;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

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
  z-index: 10;
`;

const StyledDrawer = styled(Drawer)`
  && {
    width: 300px;
    flex-shrink: 0;
    
    .MuiDrawer-paper {
      width: 250px;
      top: 80px; // 헤더바 높이만큼 top 값 설정
      height: calc(100% - 80px); // 전체 높이에서 헤더바 높이만큼 뺌
      background-color: white;
      border-right: 1px solid #e0e0e0;
    }
  }
`;

const StyledTitle = styled(Typography)`
  font-weight: bold;
  margin-bottom: 8px;
`;

const StyledServTitle = styled(Typography)`
  color: #666;
  font-size: 0.9rem;
  margin: 8px 0;
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
`;

export default AlignPage;