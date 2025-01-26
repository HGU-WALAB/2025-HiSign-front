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

  // 추가하기 버튼 활성화 여부
  const isAddButtonEnabled = newName && newEmail;

  // 다음 단계 버튼 활성화 여부 (서명자가 있을 때 활성화)
  const isNextButtonEnabled = signers.length > 0;

  // 서명자 추가 핸들러 (Recoil 상태에 추가)
  const handleAddSigner = () => {
    if (newName && newEmail) {
      const newSigner = {
        name: newName,
        email: newEmail,
        signatureFields: [],
      };
      setSigners([...signers, newSigner]);  // 상태 업데이트
      setNewName("");  // 입력 초기화
      setNewEmail("");
    }
  };

  // 서명자 삭제 핸들러 (Recoil 상태에서 제거)
  const handleDeleteSigner = (SignerEmail) => {
    setSigners(signers.filter(signer => signer.email !== SignerEmail));
  };

  const handleNextStep =  () => {
    //서명명 할당 페이지로 이동
    navigate(`/align`);
  };

  return (
    <Container>
      <StyledBody>
        <MainArea>
        <FileName>{document.name}</FileName>
          <AddSignerSection>
            <AddSignerTitle>서명자 추가하기</AddSignerTitle>
            <RowContainer>
              <Input
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                placeholder="이메일"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </RowContainer>
            <AddButton onClick={handleAddSigner} disabled={!isAddButtonEnabled}>
              추가하기
            </AddButton>
          </AddSignerSection>

          <AddSignerTitle>추가된 서명자</AddSignerTitle>
          {signers.map((signer) => (
            <SignerBox key={signer.email}>
              <SignerInfo>
                <SignerName>{signer.name}</SignerName>
                <SignerEmail>{signer.email}</SignerEmail>
              </SignerInfo>
              <CloseButton onClick={() => handleDeleteSigner(signer.email)}>
                <IoClose />
              </CloseButton>
            </SignerBox>
          ))}
        </MainArea>
      </StyledBody>

      <Footer>
        <FooterButtons>
          <NavButton onClick={() => navigate(`/list`)}>나가기</NavButton>
          <NextButton onClick={handleNextStep} disabled={!isNextButtonEnabled}>
            추가 완료
          </NextButton>
        </FooterButtons>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #e5e5e5;
`;

const StyledBody = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e5e5e5;
  padding: 20px;
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
  background-color: ${props => (props.disabled ? '#ccc' : '#03A3FF')}; /* 비활성화 시 회색, 활성화 시 파란색 */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')}; /* 비활성화 시 커서 변경 */
  pointer-events: ${props => (props.disabled ? 'none' : 'auto')}; /* 비활성화 시 클릭 불가 */
`;


const SignerBox = styled.div`
  background-color: white;
  border: 2px solid #007bff;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SignerInfo = styled.div`
  flex: 1;
`;

const SignerName = styled.span`
  font-weight: bold;
`;

const SignerEmail = styled.span`
  color: #555;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  position: relative;
  top: -20px;
`;

const Footer = styled.footer`
  background-color: white;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #ccc;
`;

const FooterButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const NavButton = styled.button`
  padding: 10px 20px;
  background-color: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const NextButton = styled.button`
  padding: 10px 20px;
  background-color:  #03A3FF;
  color: white;
  border: none;
  border-radius: 5px;
  gap: 10px;
  cursor: pointer;
`;

export default RequestPage;