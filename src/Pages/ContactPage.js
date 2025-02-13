import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";



const ContactPage = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleEmailSend = () => {
    const mailtoLink = `mailto:hisign0120@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    window.location.href = mailtoLink;
  };

  return (
    <ContactContainer>
      <ContactTitle>문의하기</ContactTitle>
      <ContactBox>
        <Description>
          HI-Sign 서비스 이용 중 궁금하신 점이나 문의사항이 있으시다면 
          아래 내용을 작성하여 문의해 주세요.
        </Description>
        
        <InputGroup>
          <Label>제목</Label>
          <Input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
          />
        </InputGroup>

        <InputGroup>
          <Label>내용</Label>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 상세히 작성해주세요"
            rows={8}
          />
        </InputGroup>

        <ButtonContainer>
          <SendButton onClick={handleEmailSend}>
            이메일 보내기
          </SendButton>
        </ButtonContainer>

        <ContactInfo>
          <InfoTitle>담당자 연락처</InfoTitle>
          <InfoText>Email: hisign0120@gmail.com</InfoText>
        </ContactInfo>
      </ContactBox>
    </ContactContainer>
  );
};

const ContactContainer = styled.div`
  max-width: 800px;
  margin: 80px auto 0;
  padding: 20px;
`;

const ContactTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
`;

const ContactBox = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #87CEEB;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #87CEEB;
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 30px;
`;

const SendButton = styled.button`
  background-color: #87CEEB;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5CACEE;
  }
`;

const ContactInfo = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const InfoText = styled.p`
  color: #666;
  line-height: 1.6;
`;

export default ContactPage;