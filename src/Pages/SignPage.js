import { Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import PDFViewer from "../components/SignPage/PDFViewer";
import SignatureOverlay from "../components/SignPage/SignatureOverlay";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

function SignPage() {

  const [signing, setSigning] = useRecoilState(signingState);
  const [currentPage, setCurrentPage] = useState(1); // 현재 표시 중인 페이지
  const navigate = useNavigate();
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [openSavedSignatures, setOpenSavedSignatures] = useState(false);
  const [selectedSavedSignature, setSelectedSavedSignature] = useState(null);
  const [signaturesByPage, setSignaturesByPage] = useState({});

  // 특정 페이지로 이동하는 함수
  const navigateToPage = (pageNumber) => {
  setCurrentPage(pageNumber);
  };

  // 서명 필드가 변경될 때마다 페이지별로 그룹화
  useEffect(() => {
    if (signing.signatureFields && signing.signatureFields.length > 0) {
      const groupedByPage = {};
      
      signing.signatureFields.forEach((field, index) => {
        const pageNumber = field.position.pageNumber;
        if (!groupedByPage[pageNumber]) {
          groupedByPage[pageNumber] = [];
        }
        groupedByPage[pageNumber].push({...field, index});
      });
      
      setSignaturesByPage(groupedByPage);
    }
  }, [signing.signatureFields]);

// 컴포넌트 마운트시 로컬 스토리지에서 선택된 서명 확인
useEffect(() => {
  const selectedSignature = localStorage.getItem('selectedSignature');
  if (selectedSignature) {
    try {
      const parsedSignature = JSON.parse(selectedSignature);
      setSelectedSavedSignature(parsedSignature);
      // 선택된 서명이 있으면 자동으로 적용
      if (signing.signatureFields && signing.signatureFields.length > 0) {
        const imageSignatureField = signing.signatureFields.find(field => field.type === 0);
        if (imageSignatureField) {
          // 서명 필드에 이미지 적용
          setSigning(prevState => ({
            ...prevState,
            signatureFields: prevState.signatureFields.map(field => 
              field.type === 0 ? { ...field, image: parsedSignature.imageUrl } : field
            )
          }));
        }
      }
      // 사용 후 로컬 스토리지 클리어
      localStorage.removeItem('selectedSignature');
    } catch (error) {
      console.error('저장된 서명 파싱 오류:', error);
    }
  }
}, [signing.signatureFields]);

// 사용자 서명 목록 불러오기
const loadUserSignatures = async () => {
  if (signing.signerEmail) {
    try {
      const response = await ApiService.getUserSignatures(signing.signerEmail);
      setSavedSignatures(response.data);
      setOpenSavedSignatures(true);
    } catch (error) {
      console.error('서명 목록 불러오기 실패:', error);
      alert('저장된 서명을 불러오는 데 실패했습니다.');
    }
  } else {
    alert('먼저 이메일 인증을 완료해주세요.');
  }
};

// 저장된 서명 선택 및 적용
const applySavedSignature = (signature) => {
  setSelectedSavedSignature(signature);
  
  // 서명 필드에 이미지 적용
  setSigning(prevState => ({
    ...prevState,
    signatureFields: prevState.signatureFields.map(field => 
      field.type === 0 ? { ...field, image: signature.imageUrl } : field
    )
  }));
  
  // 서명 사용 내역 업데이트
  ApiService.updateSignatureUsage(signature.id, {
    documentId: signing.documentId,
    documentName: signing.documentName,
    date: new Date().toISOString()
  }).catch(error => {
    console.error('서명 사용 내역 업데이트 실패:', error);
  });
  
  setOpenSavedSignatures(false);
};


  const handleSubmitSignature = async () => {
    if (!signing.documentId || signing.signatureFields.length === 0) {
      alert("서명할 필드가 없습니다.");
      return;
    }

    // ✅ 서명이 없는 필드가 있는지 검사
    const isAllSigned = signing.signatureFields.every(field => field.image || field.textData);
    if (!isAllSigned) {
        alert("모든 서명을 완료해 주세요.");
        return;
    }
    console.log("🔹 서명 저장 시작:", signing);
    
    let fileName = null;
  
    try {
      // ✅ 1. 서명 이미지 업로드
      const imageField = signing.signatureFields.find(field => field.type === 0 && field.image);
      if (imageField) {
        console.log("🔹 서명 이미지 업로드 시작...");
        const blob = await fetch(imageField.image).then(res => res.blob());
        fileName = await ApiService.uploadSignatureFile(blob, signing.signerEmail);
        console.log("✅ 서명 이미지 업로드 완료, fileName:", fileName);
      }
  
      // ✅ 2. 서명 데이터 저장
      await ApiService.saveSignatures(signing.documentId, {
        email: signing.signerEmail,
        name: signing.signerName,
        signatureFields: signing.signatureFields.map(field => ({
          signerEmail: signing.signerEmail,
          type: field.type,
          width: field.width,
          height: field.height,
          position: field.position,
          imageName: field.type === 0 ? fileName : null,
          textData: field.textData || null
        }))
      });
  
    console.log("✅ 서명 데이터 저장 및 상태 업데이트 완료!");

    alert("서명이 성공적으로 완료되었습니다!");

    navigate("/sign-complete");
    } catch (error) {
      console.error("❌ 서명 처리 실패:", error);
      alert(`서명 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <MainContainer>
      { signing.documentId && <LoadingMessage>로딩 중...</LoadingMessage>}
      <ContentWrapper>
        <Container>
          {/* 사이드바 부분 */}
          {signing.documentId && (
            <StyledDrawer variant="permanent" anchor="left">
              <DrawerHeader>
                <StyledTitle variant="h6">서명 정보</StyledTitle>
                <Divider />
                <UserInfoSection>
                  <UserInfoItem>
                    <InfoLabel>이름:</InfoLabel>
                    <InfoValue>{signing.signerName}</InfoValue>
                  </UserInfoItem>
                  <UserInfoItem>
                    <InfoLabel>이메일:</InfoLabel>
                    <InfoValue>{signing.signerEmail}</InfoValue>
                  </UserInfoItem>
                  <UserInfoItem>
                    <InfoLabel>문서:</InfoLabel>
                    <InfoValue>{signing.documentName}</InfoValue>
                  </UserInfoItem>
                </UserInfoSection>
                <Divider />
                <StyledServTitle variant="h7">서명 위치 목록</StyledServTitle>
                <SignatureCountBadge>
                  총 {signing.signatureFields?.length || 0}개의 서명이 필요합니다
                </SignatureCountBadge>
                <Divider />
              </DrawerHeader>

              <List>
                {Object.entries(signaturesByPage).map(([pageNum, fields]) => (
                  <div key={pageNum}>
                    <PageHeader>
                      {parseInt(pageNum) === currentPage ? (
                        <CurrentPageLabel>{pageNum}페이지 (현재 보는 중)</CurrentPageLabel>
                      ) : (
                        <PageLabel onClick={() => navigateToPage(parseInt(pageNum))}>
                          {pageNum}페이지로 이동
                        </PageLabel>
                      )}
                      <SignatureBadge>{fields.length}개</SignatureBadge>
                    </PageHeader>
                    
                    {fields.map((field, idx) => (
                      <ListItem key={idx}>
                        <ListItemText 
                          primary={
                            <SignatureFieldInfo>
                              <div>서명 #{idx + 1}</div>
                              <SignatureStatus>
                                {field.image || field.textData ? "완료" : "미완료"}
                              </SignatureStatus>
                            </SignatureFieldInfo>
                          }
                          secondary={`위치: (${Math.round(field.position.x)}, ${Math.round(field.position.y)})`}
                        />
                      </ListItem>
                    ))}
                    <PageDivider />
                  </div>
                ))}
              </List>
            </StyledDrawer>
          )}

          {/* PDF 및 서명 영역 표시 */}
          {signing.documentId && signing.fileUrl && (
            <DocumentSection>
              <DocumentContainer>
                <PDFViewer
                  pdfUrl={signing.fileUrl}
                  setCurrentPage={setCurrentPage}
                />
                <SignatureOverlay currentPage={currentPage} />
              </DocumentContainer>
              
              <ButtonContainer>
                <CompleteButton onClick={handleSubmitSignature}>서명 완료</CompleteButton>
              </ButtonContainer>
            </DocumentSection>
          )}
        </Container>
      </ContentWrapper>
    </MainContainer>
  );
}

// 스타일 컴포넌트
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const ContentWrapper = styled.div`
  flex: 1;
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
  max-width: 800px;
  margin: 20px auto;
  position: relative;
  background-color: #f5f5f5;
`;

const DrawerHeader = styled.div`
  padding: 16px;
`;

const UserInfoSection = styled.div`
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
`;

const UserInfoItem = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  width: 60px;
`;

const InfoValue = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f0f0f0;
  margin-top: 4px;
`;

const PageLabel = styled.span`
  cursor: pointer;
  color: #0066cc;
  &:hover {
    text-decoration: underline;
  }
`;

const CurrentPageLabel = styled.span`
  font-weight: bold;
  color: #333;
`;

const SignatureBadge = styled.span`
  background-color: #0066cc;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
`;

const SignatureFieldInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SignatureStatus = styled.span`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: ${props => props.children === "완료" ? "#4CAF50" : "#ff9800"};
  color: white;
`;

const PageDivider = styled.hr`
  margin: 4px 0;
  border: none;
  border-top: 1px dashed #e0e0e0;
`;

const SignatureCountBadge = styled.div`
  margin: 10px 0;
  padding: 6px 10px;
  background-color: #e1f5fe;
  border-radius: 4px;
  color: #0277bd;
  font-size: 0.9rem;
  text-align: center;
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

const ButtonContainer = styled.div`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
`;

const CompleteButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  font-size: 1rem;
  font-weight: bold;
  color: white;
`;

const StyledDrawer = styled(Drawer)`
  && {
    width: 300px;
    flex-shrink: 0;
    
    .MuiDrawer-paper {
      width: 300px; // 기존 250px → 300px
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

export default SignPage;

