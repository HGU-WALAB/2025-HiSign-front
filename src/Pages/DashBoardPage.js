import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import ApiService from "../utils/ApiService"; 

const DashBoardPage = () => {
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    ApiService.fetchDocuments("received-with-requester")
      .then((response) => {
        const sortedDocs = response.data
          .filter((doc) => doc.status !== 5)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentDocuments(sortedDocs.slice(0, 5));
      })
      .catch((error) => {
        console.error("문서 불러오기 실패:", error);
      });
  }, []);

  const getStatusLabel = (status) => {
    const labels = {
      0: "서명중",
      1: "완료",
      2: "거절",
      3: "취소",
      4: "만료",
    };
    return labels[status] || "알 수 없음";
  };

  return (
    <Container>
      <Title>Hi-Sign 대시보드</Title>

      <Section>
        <SectionTitle>최근 문서</SectionTitle>
        <CardContainer>
          {recentDocuments.map((doc) => (
            <DocumentCard key={doc.id}>
              <DocTitle>{doc.requestName}</DocTitle>
              <DocInfo>상태: {getStatusLabel(doc.status)}</DocInfo>
              <DocInfo>생성일: {moment(doc.createdAt).format('YYYY/MM/DD')}</DocInfo>
              <DetailLink to={`/detail/${doc.id}`}>자세히 보기</DetailLink>
            </DocumentCard>
          ))}
        </CardContainer>
      </Section>

      <Section>
        <SectionTitle>사용 방법</SectionTitle>
        <ProcessList>
          <ProcessItem>1. 서명 요청: 문서를 업로드하고 요청을 만듭니다.</ProcessItem>
          <ProcessItem>2. 문서 공유: 상대방에게 문서를 전달합니다.</ProcessItem>
          <ProcessItem>3. 서명 진행: 상대방이 서명 또는 거절합니다.</ProcessItem>
          <ProcessItem>4. 완료 확인: 완료된 문서를 확인하거나 다운로드합니다.</ProcessItem>
        </ProcessList>
      </Section>

      <InquirySection>
        <p>도움이 필요하신가요?</p>
        <Link to="/contact">
          <InquiryButton>문의하기</InquiryButton>
        </Link>
      </InquirySection>
    </Container>
  );
};

export default DashBoardPage;

// ------------------ Styled Components ------------------
const Container = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: auto;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Section = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const DocumentCard = styled.div`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 300px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DocTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const DocInfo = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const DetailLink = styled(Link)`
  margin-top: auto;
  color: #1976d2;
  font-weight: bold;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const ProcessList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProcessItem = styled.li`
  font-size: 1rem;
  color: #555;
  background: #eef4ff;
  padding: 10px 15px;
  border-radius: 8px;
`;

const InquirySection = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const InquiryButton = styled.button`
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #115293;
  }
`;