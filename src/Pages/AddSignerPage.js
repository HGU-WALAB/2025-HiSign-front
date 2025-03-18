import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { signerState } from "../recoil/atom/signerState";
import { taskState } from "../recoil/atom/taskState";

const AddSignerPage = () => {
  const navigate = useNavigate();
  const document = useRecoilValue(taskState);
  const [signers, setSigners] = useRecoilState(signerState);

  const [newName, setNewName] = useState("");
  const [newEmailPrefix, setNewEmailPrefix] = useState("");
  const [newEmailDomain, setNewEmailDomain] = useState("@handong.ac.kr");

  const isAddButtonEnabled = newName && newEmailPrefix;
  const isNextButtonEnabled = signers.length > 0;

  const validateEmail = (email) => {
    return email.endsWith("@handong.ac.kr") || email.endsWith("@handong.edu");
  };

  const handleAddSigner = () => {
    const newEmail = newEmailPrefix + newEmailDomain;
    if (newName && newEmail && validateEmail(newEmail)) {
      const newSigner = {
        name: newName,
        email: newEmail,
        signatureFields: [],
      };
      setSigners([...signers, newSigner]);
      setNewName("");
      setNewEmailPrefix("");
      setNewEmailDomain("@handong.ac.kr"); // 기본값으로 초기화
    } 
  };

  const handleDeleteSigner = (emailToDelete) => {
    setSigners((prevSigners) =>
        prevSigners.filter((signer) => signer.email !== emailToDelete)
    );
  };

  const handleNextStep = () => {
    navigate(`/align`);
  };

  return (
      <Container>
        <StyledBody>
          <MainArea>
            <RequestName>{document.requestName}</RequestName>
            <FileName>선택된 문서: {document.fileName}</FileName>
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
                    value={newEmailPrefix}
                    onChange={(e) => setNewEmailPrefix(e.target.value)}
                />
                {/*셀렉터*/}
                <Select
                    value={newEmailDomain}
                    onChange={(e) => setNewEmailDomain(e.target.value)}
                >
                  <option value="@handong.ac.kr">@handong.ac.kr</option>
                  <option value="@handong.edu">@handong.edu</option>
                </Select>
              </RowContainer>
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
                  <DeleteButton onClick={() => handleDeleteSigner(signer.email)}>
                    <IoClose />
                  </DeleteButton>
                </SignerBox>
            ))}
          </MainArea>
        </StyledBody>

        <FloatingButtonContainer>
          <GrayButton onClick={() => navigate(`/tasksetup`)}>이전으로</GrayButton>
          <GrayButton onClick={() => navigate(`/request-document`)}>나가기</GrayButton>
          <NextButton onClick={handleNextStep} disabled={!isNextButtonEnabled}>다음단계</NextButton>
        </FloatingButtonContainer>
      </Container>
  );
};
export default AddSignerPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
`;

const MainArea = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 600px;
`;

const RequestName = styled.h2`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const FileName = styled.h3`
  font-size: 16px;
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
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: 100%;
  font-size: 14px;
`;

const Select = styled.select`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: 100%;
  font-size: 14px;
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  color: white;
  border: none;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
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
`;

const SignerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SignerName = styled.span`
  font-weight: bold;
`;

const SignerEmail = styled.span`
  color: #555;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
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

const ButtonBase = styled.button`
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
`;

const GrayButton = styled(ButtonBase)`
  background-color: #ccc;
`;

const NextButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
`;
