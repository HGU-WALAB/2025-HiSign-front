import { Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import ConfirmModal from "../components/ConfirmModal";
import PDFViewer from "../components/SignPage/PDFViewer";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

function SignPage() {
  const [signing, setSigning] = useRecoilState(signingState);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [selectedSavedSignature, setSelectedSavedSignature] = useState(null);
  const [signaturesByPage, setSignaturesByPage] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfScale, setPdfScale] = useState(1);
  
  // 특정 페이지로 이동하는 함수
  const navigateToPage = (pageNumber) => {
  setCurrentPage(pageNumber);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
  };

  // 서명 필드가 변경될 때마다 페이지별로 그룹화
  useEffect(() => {
    if (signing.signatureFields?.length) {
      const grouped = {};
      signing.signatureFields.forEach((field, index) => {
        const page = field.position.pageNumber;
        if (!grouped[page]) grouped[page] = [];
        grouped[page].push({ ...field, index });
      });
      setSignaturesByPage(grouped);
    }
  }, [signing.signatureFields]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedSignature');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedSavedSignature(parsed);
        const imageField = signing.signatureFields.find(f => f.type === 0);
        if (imageField) {
          setSigning(prev => ({
            ...prev,
            signatureFields: prev.signatureFields.map(f =>
              f.type === 0 ? { ...f, image: parsed.imageUrl } : f
            )
          }));
        }
        localStorage.removeItem('selectedSignature');
      } catch (err) {
        console.error('서명 불러오기 오류:', err);
      }
    }
  }, [signing.signatureFields]);

  const handleSubmitSignature = async () => {
    if (!signing.documentId || !signing.signatureFields.length) {
      alert("서명할 필드가 없습니다.");
      return;
    }

    const allSigned = signing.signatureFields.every(f => f.image || f.textData);
    if (!allSigned) {
      alert("모든 서명을 완료해 주세요.");
      return;
    }

    let fileName = null;
    setLoading(true);

    try {
      const imageField = signing.signatureFields.find(f => f.type === 0 && f.image);
      if (imageField) {
        const blob = await fetch(imageField.image).then(res => res.blob());
        fileName = await ApiService.uploadSignatureFile(blob, signing.signerEmail);
      }

      await ApiService.saveSignatures(signing.documentId, {
        email: signing.signerEmail,
        name: signing.signerName,
        signatureFields: signing.signatureFields.map(f => ({
          signerEmail: signing.signerEmail,
          type: f.type,
          width: f.width,
          height: f.height,
          position: f.position,
          imageName: f.type === 0 ? fileName : null,
          textData: f.textData || null,
        })),
      });

    alert("서명이 성공적으로 완료되었습니다!");

    navigate("/sign-complete");
    } catch (error) {
      console.error("❌ 서명 처리 실패:", error);
      alert(`서명 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <MainContainer>
      <StyledDrawer variant="permanent" anchor="left">
        <DrawerHeader>
          <StyledTitle variant="h6">서명 정보</StyledTitle>
          <Divider />
          <UserInfoSection>
            <UserInfoItem><InfoLabel>이름:</InfoLabel><InfoValue>{signing.signerName}</InfoValue></UserInfoItem>
            <UserInfoItem><InfoLabel>이메일:</InfoLabel><InfoValue>{signing.signerEmail}</InfoValue></UserInfoItem>
            <UserInfoItem><InfoLabel>문서:</InfoLabel><InfoValue>{signing.documentName}</InfoValue></UserInfoItem>
          </UserInfoSection>
          <Divider />
          <StyledServTitle>서명 필요 갯수</StyledServTitle>
          <SignatureCountBadge>총 {signing.signatureFields?.length || 0}개의 서명이 필요합니다</SignatureCountBadge>
          <Divider />
        </DrawerHeader>

        <List>
          {Object.entries(signaturesByPage).map(([pageNum, fields]) => (
            <div key={pageNum}>
              <PageHeader>
                {parseInt(pageNum) === currentPage ? (
                  <CurrentPageLabel>{pageNum}페이지 (현재)</CurrentPageLabel>
                ) : (
                  <PageLabel onClick={() => navigateToPage(parseInt(pageNum))}>
                    {pageNum}페이지로 이동
                  </PageLabel>
                )}
                <SignatureBadge>{fields.length}개</SignatureBadge>
              </PageHeader>
              {fields.map((field, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={
                    <SignatureFieldInfo>
                      <div>서명 #{idx + 1}</div>
                      <SignatureStatus>{field.image || field.textData ? "완료" : "미완료"}</SignatureStatus>
                    </SignatureFieldInfo>
                  } />
                </ListItem>
              ))}
              <PageDivider />
            </div>
          ))}
        </List>
        <DrawerFooter>
          <CompleteButton onClick={handleSubmitSignature}>서명 완료</CompleteButton>
        </DrawerFooter>
      </StyledDrawer>

      <RightContainer>
        <DocumentSection>
          <DocumentContainer>
            <PDFViewer
                pdfUrl={signing.fileUrl}
                setCurrentPage={setCurrentPage}
                onScaleChange={setPdfScale}
                type="sign"
              />
          </DocumentContainer>
        </DocumentSection>
      </RightContainer>
      <ConfirmModal
        open={open}
        loading={loading}
        onClose={handleCloseModal}
        onConfirm={handleSubmitSignature}
        title="서명 완료"
        message="서명을 완료하시겠습니까? 완료 후에는 수정할 수 없습니다."
      />
    </MainContainer>
  );
}

export default SignPage;

// 스타일 통합
const MainContainer = styled.div`
  margin-left: 250px; // 사이드바 영역 고려
  display: flex;
  min-height: 100vh;
`;

const RightContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

const DocumentSection = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
`;

const DocumentContainer = styled.div`
  width: 800px;
  margin: 20px 0;
  position: relative;
`;




const StyledDrawer = styled(Drawer)`
  && {
    width: 300px;
    flex-shrink: 0;
    .MuiDrawer-paper {
      width: 300px;
      height: 100%;
      background-color: white;
      border-right: 1px solid #e0e0e0;
    }
  }
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

const StyledTitle = styled(Typography)`
  font-weight: bold;
`;

const StyledServTitle = styled(Typography)`
  color: #666;
  font-size: 0.9rem;
  margin: 8px 0;
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

const Divider = styled.hr`
  margin: 10px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
  width: 100%;
`;

const DrawerFooter = styled.div`
  padding: 16px;
  text-align: center;
`;

const CompleteButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  font-size: 1rem;
  font-weight: bold;
  color: white;
`;
