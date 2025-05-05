import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import PDFViewer from "../components/SignPage/PDFViewer";
import { signingState } from "../recoil/atom/signingState";

const CheckTaskPage = () => {
  const [signing, setSigning] = useRecoilState(signingState);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!signing.documentId) {
      alert("유효한 문서 정보가 없습니다. 이메일을 먼저 인증해주세요.");
      navigate("/");
    }
  }, [signing.documentId, navigate]);

  return (
    <MainContainer>
      <ContentWrapper>
        <Sidebar>
          <InfoSection>
            <InfoItem><Label>작업 요청자:</Label><Value>{signing.requesterName}</Value></InfoItem>
            <InfoItem><Label>작업명:</Label><Value>{signing.requestName}</Value></InfoItem>
            <InfoItem><Label>작업 요청 상세:</Label><Value>{signing.description}</Value></InfoItem>
            <InfoItem><Label>문서 이름:</Label><Value>{signing.documentName}</Value></InfoItem>
            <InfoItem><Label>서명자:</Label><Value>{signing.signerName}</Value></InfoItem>
            <InfoItem><Label>서명 상태:</Label><Value>{signing.isSigned ? "서명 완료" : "서명 대기중"}</Value></InfoItem>
          </InfoSection>
        </Sidebar>

        <PDFWrapper>
          {signing.fileUrl ? (
            <DocumentContainer>
              <PDFViewer
                pdfUrl={signing.fileUrl}
                setCurrentPage={setCurrentPage}
                onScaleChange={setPdfScale}
                type="check"
              />
            </DocumentContainer>
          ) : (
            <LoadingMessage>문서를 불러오는 중...</LoadingMessage>
          )}
        </PDFWrapper>
      </ContentWrapper>
    </MainContainer>
  );
};

export default CheckTaskPage;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 80px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
`;

const Sidebar = styled.div`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
`;

const PDFWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
`;

const InfoSection = styled.div`
  width: 100%;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

const Label = styled.span`
  font-weight: bold;
`;

const Value = styled.span`
  color: #333;
`;

const DocumentContainer = styled.div`
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
`;

const LoadingMessage = styled.p`
  color: #666;
  margin-top: 20px;
`;
