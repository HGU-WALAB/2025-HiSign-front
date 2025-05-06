// AllocatePage.js
import { Typography, Menu, MenuItem, Card, CardContent, CardActionArea, IconButton } from '@mui/material';
import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from 'styled-components';
import CompleteButton from '../components/AllocatePage/CompleteButton';
import PagingControl from "../components/PagingControl";
import { signerState } from "../recoil/atom/signerState";
import { taskState } from "../recoil/atom/taskState";
import SignatureService from "../utils/SignatureService";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const defaultColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#1A535C', '#FF9F1C', '#6A4C93'];

const AllocatePage = () => {
  const document = useRecoilValue(taskState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hoveredField, setHoveredField] = useState(null);
  const navigate = useNavigate();

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
          <DocumentHeader>
            <Typography variant="h6">{document.title || '문서 제목'}</Typography>
            <Typography variant="body2" color="textSecondary">{document.fileName || '파일명 없음'}</Typography>
          </DocumentHeader>

          <SignerList>
            <Typography variant="h6">서명 인원</Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '12px' }}>
              대상을 선택 후 위치를 지정하세요
            </Typography>
            {signers.map((signer, index) => (
              <Card
                key={signer.email}
                sx={{ marginBottom: '10px', cursor: 'pointer', borderLeft: `6px solid ${signer.color || defaultColors[index % defaultColors.length]}` }}
                onClick={(e) => handleMenuClick(e, signer)}
              >
                <CardActionArea>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {signer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {signer.email}
                    </Typography>
                    <Typography variant="caption" sx={{
                      backgroundColor: '#f5f5f5',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      marginTop: '5px'
                    }}>
                      서명 {signer.signatureFields.length}개 할당
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </SignerList>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={addSignatureBox}>서명 추가</MenuItem>
          </Menu>

          <DocumentSection>
            {document.fileUrl ? (
              <DocumentContainer>
                <Document file={document.fileUrl} onLoadSuccess={(data) => setTotalPages(data.numPages)}>
                  <Page pageNumber={pageNum} width={800} />
                </Document>

                {signers.map((signer, index) =>
                  signer.signatureFields
                    .filter((box) => box.position.pageNumber === pageNum)
                    .map((box) => (
                      <Rnd
                        key={box.id}
                        bounds="parent"
                        size={{ width: box.width, height: box.height }}
                        position={{ x: box.position.x, y: box.position.y }}
                        lockAspectRatio={2 / 1}
                        onDragStop={(e, d) => {
                          SignatureService.updateSignaturePosition(setSigners, signer.email, box.id, { x: d.x, y: d.y });
                        }}
                        onResizeStop={(e, direction, ref, delta, pos) => {
                          const adjustedWidth = ref.offsetWidth;
                          const adjustedHeight = adjustedWidth / 2;
                          SignatureService.updateSignatureSize(setSigners, signer.email, box.id, adjustedWidth, adjustedHeight, pos);
                        }}
                        onMouseEnter={() => setHoveredField(box.id)}
                        onMouseLeave={() => setHoveredField(null)}
                      >
                        <SignatureBoxContainer color={signer.color || defaultColors[index % defaultColors.length]}>
                          {signer.name}
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
          </DocumentSection>

          {/* ✅ 버튼 영역 이동 */}
          <FloatingButtonContainer>
            <FloatingGrayButton onClick={() => navigate("/request")}>이전으로</FloatingGrayButton>
            <CompleteButton />
          </FloatingButtonContainer>
        </Container>
      </ContentWrapper>
    </MainContainer>
  );
};

// 스타일 정의
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 50vh;
  background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
  flex: 1;
  /* margin-top: 80px; */
`;

const Container = styled.div`
  margin: 0 auto;
  padding: 20px;
  position: relative;
`;

const DocumentHeader = styled.div`
  background-color: white;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const SignerList = styled.div`
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const DocumentSection = styled.div`
  padding: 20px;
`;

const DocumentContainer = styled.div`
  max-width: 802px;
  margin: 20px auto;
  border: 1px solid #999;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const SignatureBoxContainer = styled.div`
  position: relative;
  border: 2px dashed ${(props) => props.color || '#000'};
  background-color: ${(props) => props.color ? `${props.color}20` : 'rgba(0, 0, 0, 0.1)'};
  cursor: move;
  padding: 10px;
  text-align: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-weight: bold;
  color: #333;
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

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const FloatingButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

const FloatingGrayButton = styled.button`
  background-color: #ccc;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #bbb;
  }
`;

export default AllocatePage;
