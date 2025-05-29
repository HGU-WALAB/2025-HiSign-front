// AllocatePage.js
import { Card, CardActionArea, CardContent, Menu, MenuItem, Typography, Grid } from '@mui/material';
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import CompleteButton from '../components/AllocatePage/CompleteButton';
import PagingControl from "../components/PagingControl";
import StepProgressBar from "../components/StepProgressBar";
import { signerState } from "../recoil/atom/signerState";
import { taskState } from "../recoil/atom/taskState";
import { ButtonContainer, GrayButton, OutlineButton } from "../styles/CommonStyles";
import SignatureService from "../utils/SignatureService";
import { loginMemberState } from '../recoil/atom/loginMemberState';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const defaultColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#1A535C', '#FF9F1C', '#6A4C93'];

const AllocatePage = () => {
  const [documentData, setDocumentData] = useRecoilState(taskState);
  const loginMember = useRecoilValue(loginMemberState);
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

  const handleMenuClose = () => setMenuAnchor(null);

  const addSignatureBox = () => {
    if (selectedSigner) {
      SignatureService.addSignatureBox(setSigners, selectedSigner.email, pageNum);
      handleMenuClose();
    }
  };

  const handleExit = () => {
    if (window.confirm('정말로 나가시겠습니까?\n나가시면 진행상황은 초기화 됩니다.')) {
      setDocumentData({
        requestName: '',
        description: '',
        ownerId: null,
        fileName: '',
        fileUrl: null,
        expirationDate: null,
        author: '',
        isRejectable: null,
        type: null,
        password: null,
      });
      setSigners([]);
      navigate(`/request-document`);
    }
  };
  

  return (
    <MainContainer>
      <StepProgressBar currentStep={2} />

      <ContentWrapper>
        <Container>
       <DocumentHeader>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', marginBottom: '4px' }}>
      <Typography variant="body2" style={{ fontWeight: 'bold', width: '80px' }}>
        작업명:
      </Typography>
      <Typography variant="body2">
        {documentData.requestName || '작업명 없음'}
      </Typography>
    </div>

 <div style={{ display: 'flex', marginBottom: '4px' }}>
  <Typography variant="body2" style={{ fontWeight: 'bold', width: '80px' }}>
    작성자:
  </Typography>
  <Typography variant="body2">
    {loginMember?.name || '이름 없음'}
  </Typography>
</div>

    <div style={{ display: 'flex' }}>
      <Typography variant="body2" style={{ fontWeight: 'bold', width: '80px' }}>
        문서 제목:
      </Typography>
      <Typography variant="body2">
        {documentData.fileName || '파일명 없음'}
      </Typography>
    </div>
  </div>
</DocumentHeader>


          <SignerList>
            <Typography variant="h6" stype = {{ fontWeight : 'bold'}}> 서명 인원</Typography>
            <Typography variant="body3"style={{ marginBottom: '100px' }}>
              대상을 선택 후 위치를 지정하세요.
             
             
            </Typography>
             <br></br>
            {signers.map((signer, index) => (
              
  <Card
    key={signer.email}
    sx={{
      width: '100%',
      marginBottom: '10px',
      cursor: 'pointer',
      borderLeft: `6px solid ${signer.color || defaultColors[index % defaultColors.length]}`,
    }}
    onClick={(e) => handleMenuClick(e, signer)}
  >
    <CardActionArea>
      <CardContent>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6}>
           <Typography variant="subtitle2" fontWeight="bold">
  {index + 1}. {signer.name}
</Typography>
            <Typography variant="body2" color="text.secondary">
              {signer.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              서명 {signer.signatureFields.length}개 할당
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </CardActionArea>
  </Card>
))}

          </SignerList>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={addSignatureBox}>서명 추가</MenuItem>
          </Menu>

          <DocumentSection>
            {documentData.fileUrl ? (
              <DocumentContainer>
                <Document
                  file={documentData.fileUrl}
                  onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
                >
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
                        onDragStop={(e, d) =>
                          SignatureService.updateSignaturePosition(
                            setSigners,
                            signer.email,
                            box.id,
                            { x: d.x, y: d.y }
                          )
                        }
                        onResizeStop={(e, direction, ref, delta, pos) => {
                          const adjustedWidth = ref.offsetWidth;
                          const adjustedHeight = adjustedWidth / 2;
                          SignatureService.updateSignatureSize(
                            setSigners,
                            signer.email,
                            box.id,
                            adjustedWidth,
                            adjustedHeight,
                            pos
                          );
                        }}
                        onMouseEnter={() => setHoveredField(box.id)}
                        onMouseLeave={() => setHoveredField(null)}
                      >
                        <SignatureBoxContainer color={signer.color || defaultColors[index % defaultColors.length]}>
                          {signer.name}
                          {hoveredField === box.id && (
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                SignatureService.removeSignatureBox(
                                  setSigners,
                                  signer.email,
                                  box.id
                                );
                              }}
                            >
                              삭제
                            </DeleteButton>
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

          <ButtonContainer>
            <OutlineButton onClick={() => navigate('/request')}>
              이전으로
            </OutlineButton>
            <GrayButton onClick={handleExit}>나가기</GrayButton>
            <CompleteButton />
          </ButtonContainer>
        </Container>
      </ContentWrapper>
    </MainContainer>
  );
};

// 스타일 정의
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 60vh;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Container = styled.div`
  max-width: 875px;
  margin: 0 auto;
  padding: 20px 10px 120px;  // 하단 버튼과 겹치지 않도록 패딩 추가
  position: relative;
`;

const DocumentHeader = styled.div`
  width: 100%;
  background-color: white;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0px 4px 2px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SignerList = styled.div`
  width: 100%;
  background-color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0px 4px 2px 3px rgba(0, 0, 0, 0.08);
`;

const DocumentSection = styled.div`
  padding: 20px;
`;

const DocumentContainer = styled.div`
  max-width: 802px; //기본이 802
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
  top: -8px;
  right: -8px;
  cursor: pointer;
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 2px 5px;
  border-radius: 3px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 16px;
  color: #999;
`;

export default AllocatePage;
