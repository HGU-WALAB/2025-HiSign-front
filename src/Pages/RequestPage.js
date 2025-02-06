import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from "styled-components";
import { documentState } from '../recoil/atom/documentState';
import { signerState } from '../recoil/atom/signerState';

const RequestPage = () => {
  const navigate = useNavigate();
  const document = useRecoilValue(documentState);
  const [signers, setSigners] = useRecoilState(signerState);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const isAddButtonEnabled = newName && newEmail;
  const isNextButtonEnabled = signers.length > 0;

  const validateEmail = (email) => {
    return email.endsWith('@handong.ac.kr') || email.endsWith('@handong.edu');
  };

  const handleAddSigner = () => {
    if (newName && newEmail && validateEmail(newEmail)) {
      const newSigner = {
        name: newName,
        email: newEmail,
        signatureFields: [],
      };
      setSigners([...signers, newSigner]);
      setNewName("");
      setNewEmail("");
    } else if (!validateEmail(newEmail)) {
      alert('이메일은 @handong.ac.kr 또는 @handong.edu로 끝나야 합니다.');
    }
  };

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleDeleteSigner = (emailToDelete) => {
    console.log('Deleting signer with email:', emailToDelete);
    setSigners(prevSigners => 
      prevSigners.filter(signer => signer.email !== emailToDelete)
    );
  };

  const handleNextStep = () => {
    navigate(`/align`);
  };

  return (
    <Container>
      <StyledBody>
        <MainArea>
          <FileName>업로드 한 파일: {document.name}</FileName>
          <AddSignerSection>
            <AddSignerTitle>서명자 추가하기</AddSignerTitle>
            <RowContainer>
              <Input
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <br />
              <Input
                placeholder="이메일 (@handong.ac.kr 또는 .edu)"
                value={newEmail}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (newEmail && !validateEmail(newEmail)) {
                    alert('이메일은 @handong.ac.kr 또는 @handong.edu로 끝나야 합니다.');
                  }
                }}
              />
            </RowContainer>
            <br />
            <AddButton onClick={handleAddSigner} disabled={!isAddButtonEnabled}>
              추가하기
            </AddButton>
          </AddSignerSection>

          <AddSignerTitle>추가된 서명자 목록</AddSignerTitle>
          {signers.map((signer) => (
            <SignerBox key={signer.email}>
              <SignerInfo>
                <SignerName>{signer.name}</SignerName>
                <SignerEmail>{signer.email}</SignerEmail>
              </SignerInfo>
              <DeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSigner(signer.email);
                }}
              >
                <IoClose />
              </DeleteButton>
            </SignerBox>
          ))}
        </MainArea>
      </StyledBody>

      <FloatingButtonContainer>
        <FloatingButton 
          onClick={() => navigate(`/upload`)} 
          backgroundColor="#ccc"
          position="left"
        >
          이전으로
        </FloatingButton>
        
        <FloatingButton 
          onClick={() => navigate(`/request-document`)} 
          backgroundColor="#ccc"
          position="center"
        >
          나가기
        </FloatingButton>
        
        <FloatingButton 
          onClick={handleNextStep} 
          backgroundColor="#03A3FF"
          disabled={!isNextButtonEnabled}
          position="right"
        >
          추가 완료
        </FloatingButton>
      </FloatingButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #e5e5e5;
  position: relative;
`;

const StyledBody = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e5e5e5;
  padding: 20px;
  padding-bottom: 80px;
`;

const MainArea = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 600px;
`;

const FileName = styled.h2`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const AddSignerSection = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const AddSignerTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  border: none;
  background: none;
  width: 100%;
  padding: 5px;
  font-size: 14px;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => (props.disabled ? '#ccc' : '#03A3FF')};
  color: white;
  border: none;
  border-radius: 3px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')};
`;

const SignerBox = styled.div`
  background-color: white;
  border: 2px solid #007bff;
  border-radius: 5px;
  padding: 15px 20px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const SignerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SignerName = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const SignerEmail = styled.span`
  color: #555;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #ff0000;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 1000;
`;

const FloatingButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.disabled ? '#ccc' : props.backgroundColor};
  color: white;
  border: none;
  border-radius: 25px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 6px 12px rgba(0, 0, 0, 0.3)'};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export default RequestPage;