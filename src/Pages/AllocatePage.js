import { Drawer, List, ListItem, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from 'styled-components';
import CompleteButton from '../components/AllocatePage/CompleteButton';
import PagingControl from "../components/PagingControl";
import { signerState } from "../recoil/atom/signerState";
import { taskState } from "../recoil/atom/taskState";
import SignatureService from "../utils/SignatureService";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const AllocatePage = () => {
  const document = useRecoilValue(taskState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hoveredField, setHoveredField] = useState(null);

  const handleMenuClick = (event, signer) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSigner(signer);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const addSignatureBox = () => {
    if (selectedSigner) {
      SignatureService.addSignatureBox(setSigners, selectedSigner.email, pageNum);
      handleMenuClose();
    }
  };

  return (
    <MainContainer>
      <ContentWrapper>
        <Container>
          <StyledDrawer variant="permanent" anchor="left">
            <DrawerHeader>
              <StyledTitle variant="h6">서명 인원</StyledTitle>
              <Divider />
              <StyledServTitle variant="h7">대상을 선택 후 위치를 지정하세요</StyledServTitle>
              <Divider />
            </DrawerHeader>
            <List>
              {signers.map((signer) => (
                <ListItem button key={signer.email} onClick={(e) => handleMenuClick(e, signer)}>
                  <ListItemText 
                    primary={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{signer.name}</span>
                        <SignatureCount>서명 {signer.signatureFields.length}개 할당</SignatureCount>
                      </div>
                    }
                    secondary={signer.email}
                  />
                </ListItem>
              ))}
            </List>
          </StyledDrawer>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={addSignatureBox}>서명 추가</MenuItem>
          </Menu>

          <DocumentSection>
            {document.fileUrl ? (
              <DocumentContainer>
                <Document file={document.fileUrl} onLoadSuccess={(data) => setTotalPages(data.numPages)}>
                  <Page pageNumber={pageNum} width={800} onRenderSuccess={(page) => { console.log("렌더링된 페이지 높이: ", page.height);}} />
                </Document>

                {signers.map((signer) =>
                  signer.signatureFields
                    .filter((box) => box.position.pageNumber === pageNum)
                    .map((box, index) => (
                      <Rnd
                        key={box.id}
                        bounds="parent"
                        size={{ width: box.width, height: box.height }}
                        position={{ x: box.position.x, y: box.position.y }}
                        lockAspectRatio={2 / 1}
                        onDragStop={(e, d) => {
                          console.log("선택된 박스 : ", signer, box.id);
                          SignatureService.updateSignaturePosition(setSigners, signer.email, box.id, { x: d.x, y: d.y });
                        }}
                        onResizeStop={(e, direction, ref, delta, pos) => {
                          const adjustedWidth = ref.offsetWidth;
                          const adjustedHeight = adjustedWidth / 2; // ✅ 2:1 비율 유지
                          console.log("선택된 박스 : ", signer, box.id);
                          SignatureService.updateSignatureSize(setSigners, signer.email, box.id, adjustedWidth, adjustedHeight, pos);
                        }}
                        onMouseEnter={() => setHoveredField(box.id)}
                        onMouseLeave={() => setHoveredField(null)}
                      >
                        
                        <SignatureBoxContainer>
                          {signer.name}의 서명
                          {hoveredField === box.id && (
                            <DeleteButton onClick={(e) => {
                              e.stopPropagation();
                              SignatureService.removeSignatureBox(setSigners, signer.email, box.id);
                            }}>삭제</DeleteButton>
                          )}
                        </SignatureBoxContainer>
                        
                      </Rnd>
                    ))
                )}
              </DocumentContainer>
            ) : (
              <LoadingMessage>문서를 불러오는 중입니다...</LoadingMessage>
            )}

            <PagingControl pageNum={pageNum} setPageNum={setPageNum} totalPages={totalPages} />
            <ButtonContainer>
          <CompleteButton />
        </ButtonContainer>
          </DocumentSection>
        </Container>
      </ContentWrapper>
    </MainContainer>
  );
};

// ✅ ESLint 오류가 발생했던 스타일 컴포넌트 추가
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-top: 80px;
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

const DocumentContainer = styled.div`
  max-width: 802px;
  margin: 20px auto;
  border: 1px solid #999;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DrawerHeader = styled.div`
  padding: 16px;
`;

const Divider = styled.hr`
  margin: 10px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
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
      top: 80px;
      height: calc(100% - 80px);
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

const SignatureCount = styled.span`
  font-size: 0.8rem;
  color: #666;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
`;

export default AllocatePage;
