import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import ApiService from "../utils/ApiService";
import DrawIcon from "@mui/icons-material/Draw";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import SettingsIcon from "@mui/icons-material/Settings";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function DashBoardPage() {
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

  const steps = [
    {
     title: "1. 작업 정보 입력",
icon: <EditIcon fontSize="large" />,
desc: "진행할 작업의 유형과 세부 내용을 입력하세요.",

    },
    {
      icon: <PersonAddAltIcon fontSize="large" />,
      title: "2. 서명자 지정",
desc: "문서에 서명할 사람을 추가하고 지정하세요.",
    },
    {
      icon: <SettingsIcon fontSize="large" />,
      title: "3. 서명 구역 설정",
desc: "서명자가 서명할 위치를 문서에 지정하세요.",
    },
    {
      icon: <CheckCircleIcon fontSize="large" />,
      title: "4. 작업 생성 완료",
desc: "모든 작업 생성 설정이 완료되었습니다! ",
    },
    
  ];

  return (
    <Container>
      <Title>대시 보드</Title>

      <Section>
        <SectionTitle>최근 문서</SectionTitle>
        <CardContainer>
          {recentDocuments.map((doc) => (
            <DocumentCard key={doc.id}>
              <DocTitle>{doc.requestName}</DocTitle>
              <DocInfo>상태: {getStatusLabel(doc.status)}</DocInfo>
              <DocInfo>생성일: {moment(doc.createdAt).format("YYYY/MM/DD")}</DocInfo>
              <DetailLink to={`/detail/${doc.id}`}>자세히 보기</DetailLink>
            </DocumentCard>
          ))}
        </CardContainer>
      </Section>

      <Section>
  <SectionTitle>작업 생성 방법</SectionTitle>
  <StepFlowContainer>
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <StepCardStyled>
          
          <IconCircle>{step.icon}</IconCircle>
          <br/>
          
          <StepText>
            <StepTitle>{step.title}</StepTitle>
            <StepDesc>{step.desc}</StepDesc>
          </StepText>
        </StepCardStyled>
        {index !== steps.length - 1 && <Arrow>➝</Arrow>}
      </React.Fragment>
    ))}
  </StepFlowContainer>
</Section>


      <InquirySection>
        <p>도움이 필요하신가요?</p>
        <a href="http://pf.kakao.com/_xcmKXn" target="_blank" rel="noopener noreferrer">
          <InquiryButton>문의하기</InquiryButton>
        </a>
      </InquirySection>

      <FloatingCenterLink to="/tasksetup">
        <DrawIcon style={{ fontSize: "32px" }} />
      </FloatingCenterLink>
    </Container>
  );
}

export default DashBoardPage;

// === Styled Components ===

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
  flex-direction: row;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }
`;

const DocumentCard = styled.div`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
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

const TimelineContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 10px;
  justify-content: flex-start;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }
`;

const StepItem = styled.div`
  background: #eef4ff;
  border-radius: 12px;
  padding: 20px;
  min-width: 240px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const IconCircle = styled.div`
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepText = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0;
`;

const StepDesc = styled.p`
  font-size: 0.9rem;
  color: #444;
  margin: 4px 0 0;
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

const FloatingCenterLink = styled(Link)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: #87cefa;
  color: white;
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: #4682b4;
  }
`;

const StepFlowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: col;
  gap: 12px;
  width: 100%;
`;

const StepCardStyled = styled.div`
  background: #eef4ff;
  border-radius: 12px;
  padding: 20px;
  width: 220px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;



const Arrow = styled.div`
  font-size: 1.8rem;
  color: #999;
  font-weight: bold;
  margin: 0 5px;
`;
