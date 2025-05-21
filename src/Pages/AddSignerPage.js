import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import StepProgressBar from "../components/StepProgressBar";
import { signerState } from "../recoil/atom/signerState";
import { taskState } from "../recoil/atom/taskState";
import { Container as BaseContainer, ButtonContainer, GrayButton, MainArea, NextButton, StyledBody } from "../styles/CommonStyles";
import ApiService from "../utils/ApiService";

// BaseContainer를 흰 배경으로 덮는 새로운 Container
const Container = styled(BaseContainer)`
  background-color: #fff;
`;

const AddSignerPage = () => {
  const navigate = useNavigate();
  const document = useRecoilValue(taskState);
  const [signers, setSigners] = useRecoilState(signerState);

  const [searchName, setSearchName] = useState("");        // 검색용
  const [searchEmail, setSearchEmail] = useState("");      // 검색용
  const [newName, setNewName] = useState("");
  const [newEmailPrefix, setNewEmailPrefix] = useState("");
  const [newEmailDomain, setNewEmailDomain] = useState("@handong.ac.kr");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeList, setActiveList] = useState(false);
  const [focusTarget, setFocusTarget] = useState("name"); // "name" or "email"
  const [showManualAddInputs, setShowManualAddInputs] = useState(false);
  const autocompleteRef = useRef(null);
  const itemRefs = useRef([]);
  // 디바운싱
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedName(searchName), 300);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedEmail(searchEmail), 300);
    return () => clearTimeout(handler);
  }, [searchEmail]);

  // 쿼리 설정
  const { data: nameSearchResponse } = useQuery({
    queryKey: ["signers", "name", debouncedName],
    queryFn: () => ApiService.searchSignersByName(debouncedName),
    enabled: focusTarget === "name" && !!debouncedName,
    staleTime: 1000 * 60,
  });
  const nameResults = nameSearchResponse?.data || [];

  const { data: emailSearchResponse } = useQuery({
    queryKey: ["signers", "email", debouncedEmail],
    queryFn: () => ApiService.searchSignersByEmail(debouncedEmail),
    enabled: focusTarget === "email" && !!debouncedEmail,
    staleTime: 1000 * 60,
  });
  const emailResults = emailSearchResponse?.data || [];

  const activeResults = focusTarget === "name" ? nameResults : emailResults;

  const toggleSigner = (signer) => {
    const exists = signers.some((s) => s.email === signer.email);
    if (exists) {
      setSigners(signers.filter((s) => s.email !== signer.email));
    } else {
      setSigners([
        ...signers,
        { name: signer.name, email: signer.email, signatureFields: [] },
      ]);
    }

    setSearchName("");
    setSearchEmail("");
    setActiveList(false);
    setHighlightedIndex(-1);
  };

    // 🔄 검색 결과가 바뀔 때 itemRefs 초기화
  useEffect(() => {
    itemRefs.current = [];
  }, [activeResults]);

  // 🔽 highlight 이동 시 스크롤 이동
  useEffect(() => {
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (!activeResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % activeResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + activeResults.length) % activeResults.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const selected = activeResults[highlightedIndex];
      if (selected) toggleSigner(selected);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setActiveList(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSigner = () => {
    const newEmail = newEmailPrefix + newEmailDomain;
    if (!signers.some((s) => s.email === newEmail)) {
      setSigners([
        ...signers,
        { name: newName, email: newEmail, signatureFields: [] },
      ]);
      setNewName("");
      setNewEmailPrefix("");
      setNewEmailDomain("@handong.ac.kr");
    }
  };

  const handleDeleteSigner = (email) => {
    setSigners(signers.filter((s) => s.email !== email));
  };

  const handleNextStep = () => navigate("/align");

  return (
    <Container>
      <StepProgressBar currentStep={1}/>
      <StyledBody>
        <MainArea>
          <RequestName>{document.requestName}</RequestName>
          <FileName>선택된 문서: {document.fileName}</FileName>

          <AddSignerSection>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <AddSignerTitle>서명자 검색하기</AddSignerTitle>
              <AddButtonSmall onClick={() => setShowManualAddInputs(prev => !prev)}
                active={showManualAddInputs}>
                {showManualAddInputs ? "✕ 직접 추가 닫기" : "+ 서명자 직접 추가"}
              </AddButtonSmall>
            </div>
            <RowContainer ref={autocompleteRef}>
              <Input
                placeholder="이름 검색"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setFocusTarget("name");
                  setActiveList(true);
                }}
                onFocus={() => setFocusTarget("name")}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <Input
                placeholder="이메일 검색"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setFocusTarget("email");
                  setActiveList(true);
                }}
                onFocus={() => setFocusTarget("email")}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {activeList && activeResults.length > 0 && (
                  <SearchResults>
                  {activeResults.map((signer, index) => {
                    const selected = signers.some((s) => s.email === signer.email);
                    return (
                      <SearchItem
                        key={signer.email}
                        ref={(el) => itemRefs.current[index] = el}
                        onClick={() => toggleSigner(signer)}
                        className={highlightedIndex === index ? "highlighted" : ""}
                      >
                        <span>{signer.name} {signer.position} ({signer.email})</span>
                        <span>{selected ? "✅" : "⬜"}</span>
                      </SearchItem>
                    );
                  })}
                </SearchResults>
            )}
            </RowContainer>
              {showManualAddInputs && (
                  <div style={{ marginTop: "20px" }}>
                    <AddSignerTitle>서명자 추가하기</AddSignerTitle>
                    <RowContainer>
                    <Input
                      placeholder="이름"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoComplete="off"
                    />
                  
                      <Input
                        placeholder="이메일"
                        value={newEmailPrefix}
                        onChange={(e) => setNewEmailPrefix(e.target.value)}
                        autoComplete="off"
                      />
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>@</span>
                      <Select
                        value={newEmailDomain}
                        onChange={(e) => setNewEmailDomain(e.target.value)}
                      >
                        <option value="@handong.ac.kr">handong.ac.kr</option>
                        <option value="@handong.edu">handong.edu</option>
                      </Select>
                    </RowContainer>

                    <AddButtonContainer>
                      <AddButton onClick={handleAddSigner}>추가하기</AddButton>
                    </AddButtonContainer>
                  </div>
              )}
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
      <ButtonContainer>
        <GrayButton onClick={() => navigate(`/tasksetup`)}>이전으로</GrayButton>
        <GrayButton onClick={() => navigate(`/request-document`)}>나가기</GrayButton>
        <NextButton onClick={handleNextStep} disabled={signers.length === 0}>다음단계</NextButton>
      </ButtonContainer>
    </Container>
  );
};

export default AddSignerPage;

// 스타일 컴포넌트
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
  margin:0 0 20px 0;
`;
const RowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  flex-direction: row;
  position: relative;
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
  background-color: #03a3ff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const AddButtonSmall = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  background-color: ${({ active }) => (active ? "#b5b5b5" : "#03A3FF")};  // 🔥 상태별 색상
  color: white;

  &:hover {
    background-color: ${({ active }) => (active ? "#999" : "#028de3")};
  }
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
  &:hover {
    color: #ff0000;
  }
  svg {
    width: 20px;
    height: 20px;
  }
`;
const SearchResults = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 4px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 2000;
  padding: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;
const SearchItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  background-color: white;
  &.highlighted {
    background-color: #f0f0f0;
  }
  &:hover {
    background-color: #dff1f1;
  }
`;
const AddButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  margin-top: 10px;
`;
