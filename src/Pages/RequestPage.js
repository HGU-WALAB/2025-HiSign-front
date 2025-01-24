// // import React, { useState } from "react";
// import { IoClose } from "react-icons/io5";
// import { useNavigate, useParams } from 'react-router-dom'; // useParams 추가
// import styled from "styled-components";

// const SignerPage = () => {
//   const navigate = useNavigate();
//   const { workId } = useParams();  // URL에서 workId 가져오기
//   const userId = localStorage.getItem('userid'); // 로컬스토리지에서 userid 가져오기
//   const [workName, setWorkName] = useState(''); // Work name 저장
//   const [signers, setSigners] = useState([]);
//   const [newName, setNewName] = useState("");
//   const [newEmail, setNewEmail] = useState("");
//   const [showModal, setShowModal] = useState(false); // 모달 상태
//   const [selectedWorkItemId, setSelectedWorkItemId] = useState(null); // 선택된 workItemI

//   // 추가하기 버튼 활성화 여부
//   const isAddButtonEnabled = newName && newEmail;

//   // 다음 단계 버튼 활성화 여부 (서명자가 있을 때 활성화)
//   const isNextButtonEnabled = signers.length > 0;

//   useEffect(() => {
//     if (!userId) {
//       console.error("userid가 존재하지 않습니다.");
//       return;
//     }

//     // API 호출 함수 정의
//     const fetchWorkName = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8080/api/${userId}/works/${workId}`);
//         setWorkName(response.data.name); // 서버에서 받은 작업 이름 저장
//       } catch (err) {
//         console.error('작업 이름을 가져오는 중 에러 발생:', err);
//       }
//     };

//     fetchWorkName(); // API 호출 실행
//   }, [userId, workId]); // userId나 workId가 바뀌면 다시 호출

//   // 서명자 목록을 API에서 가져오기
//   useEffect(() => {
//     if (!userId) {
//       console.error("userid가 존재하지 않습니다.");
//       return;
//     }

//     const fetchSigners = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8080/api/${userId}/${workId}/workItem/users`);
//         setSigners(response.data);  // 서버에서 받아온 서명자 목록을 상태로 설정
//       } catch (error) {
//         console.error("서명자 목록을 가져오는 중 오류 발생:", error);
//       }
//     };

//     fetchSigners();
//   }, [userId, workId]);

//   // API 호출을 통해 서명자 추가
//   const handleAddSigner = async () => {
//     if (newName && newEmail) {
//       try {
//         const response = await axios.post(`http://localhost:8080/api/${userId}/${workId}/workItem/invite`, {
//           name: newName,
//           email: newEmail
//         });

//         if (response.status === 200) {
//           // 새로운 서명자를 서버에서 다시 받아오기
//           const updatedSigners = await axios.get(`http://localhost:8080/api/${userId}/${workId}/workItem/users`);
//           setSigners(updatedSigners.data);  // 업데이트된 서명자 목록 반영
//           setNewName(""); // 입력 필드 초기화
//           setNewEmail("");
//         }
//       } catch (error) {
//         console.error("서명자 추가 중 오류 발생:", error);
//       }
//     }
//   };

//  // 서명자 삭제 요청 함수
//  const handleDeleteSigner = async () => {
//   if (selectedWorkItemId) {
//     try {
//       // API 호출을 통해 서명자 삭제 요청
//       await axios.delete(`http://localhost:8080/api/${selectedWorkItemId}/${workId}/workItems`);
//       // 삭제된 서명자를 목록에서 제거
//       setSigners(prevSigners => prevSigners.filter(signer => signer.id !== selectedWorkItemId));
//       setShowModal(false); // 모달 닫기
//     } catch (error) {
//       console.error("서명자 삭제 중 오류 발생:", error.response ? error.response.data : error.message);
//     }
//   }
// };

// // X 버튼 클릭 시 모달을 열고 삭제할 workItemId를 설정
// const handleOpenDeleteModal = (workItemId) => {
//   console.log("Opening delete modal for WorkItem:", workItemId);
//   setSelectedWorkItemId(workItemId);
//   setShowModal(true);
// };

//   return (
//     <Container>
//       <Header workName={workName} />

//       <StyledBody>
//         <MainArea>
//           <AddSignerSection>
//             <AddSignerTitle>서명자 추가하기</AddSignerTitle>
//             <RowContainer>
//               <IconInput>
//                 <Input 
//                   placeholder="이름"
//                   value={newName}
//                   onChange={(e) => setNewName(e.target.value)}
//                 />
//               </IconInput>
//             </RowContainer>
//             <RowContainer>
//               <IconInput>
//                 <Input 
//                   placeholder="이메일" 
//                   value={newEmail}
//                   onChange={(e) => setNewEmail(e.target.value)}
//                 />
//               </IconInput>
//             </RowContainer>
//             <HelpText>설정한 이메일로 서명 요청 메시지가 전송됩니다.</HelpText>
//             <AddButtonWrapper>
//               <AddButton onClick={handleAddSigner} disabled={!isAddButtonEnabled} enabled={isAddButtonEnabled}>
//                 추가하기
//               </AddButton>
//             </AddButtonWrapper>
//           </AddSignerSection>

//           <AddSignerTitle>추가된 서명자</AddSignerTitle>
//           {signers.map((signer) => (
//             <SignerBox key={signer.id}>
//               <SignerInfo>
//                 <SignerDetail>
//                   <SignerName>{signer.name}</SignerName>
//                 </SignerDetail>
//                 <SignerDetail>
//                   <SignerEmail>{signer.email}</SignerEmail>
//                 </SignerDetail>
//               </SignerInfo>
//               <CloseButton onClick={() => handleOpenDeleteModal(signer.id)}>
//                 <IoClose />
//               </CloseButton>
//             </SignerBox>
//           ))}
//         </MainArea>
//       </StyledBody>

//       <Footer>
//         <FooterButtons>
//           <NavButton onClick={() => navigate(`/home`)}>
//             나가기
//           </NavButton>
//           <NextButton onClick={() => navigate(`/assign/${workId}`)} disabled={!isNextButtonEnabled}>
//             다음 단계
//           </NextButton>
//         </FooterButtons>
//       </Footer>

//       {showModal && (
//         <ModalOverlay>
//           <ModalContent>
//             <p>정말 삭제하시겠습니까?</p>
//             <ModalButton onClick={handleDeleteSigner}>확인</ModalButton>
//             <ModalButton onClick={() => setShowModal(false)}>취소</ModalButton>
//           </ModalContent>
//         </ModalOverlay>
//       )}
//     </Container>
//   );
// };


// // Styled Components (추가된 모달 스타일 포함)

// const ModalOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   background-color: white;
//   padding: 20px;
//   border-radius: 8px;
//   text-align: center;
// `;

// const ModalButton = styled.button`
//   margin: 5px;
//   padding: 10px;
//   background-color: #007bff;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;

//   &:hover {
//     background-color: #0056b3;
//   }
// `;

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   height: 100vh;
//   background-color: #e5e5e5;
// `;

// const StyledBody = styled.main`
//   flex: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background-color: #e5e5e5;
//   padding: 20px;
// `;

// const MainArea = styled.div`
//   background-color: white;
//   border-radius: 10px;
//   padding: 30px;
//   box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
//   width: 600px;
// `;

// const AddSignerSection = styled.div`
//   background-color: white;
//   padding: 20px;
//   border-radius: 10px;
//   box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
//   margin-bottom: 20px;
// `;

// const AddSignerTitle = styled.h2`
//   font-size: 16px;
//   font-weight: bold;
//   margin-bottom: 10px;
// `;

// const RowContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 20px;
//   margin-bottom: 10px;
// `;

// const IconInput = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   background-color: #f5f5f5;
//   border-radius: 5px;
//   padding: 10px;
//   border: 1px solid #ccc;
// `;

// const Input = styled.input`
//   border: none;
//   background: none;
//   width: 100%;
//   padding: 5px;
//   font-size: 14px;
// `;

// const HelpText = styled.p`
//   font-size: 12px;
//   color: #aaa;
//   margin-bottom: 10px;
// `;

// const AddButtonWrapper = styled.div`
//   display: flex;
//   justify-content: flex-end; 
// `;

// const AddButton = styled.button`
//   padding: 10px 20px;
//   background-color: ${props => (props.disabled ? '#ccc' : '#03A3FF')}; /* 비활성화 시 회색, 활성화 시 파란색 */
//   color: white;
//   border: none;
//   border-radius: 5px;
//   cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')}; /* 비활성화 시 커서 변경 */
//   pointer-events: ${props => (props.disabled ? 'none' : 'auto')}; /* 비활성화 시 클릭 불가 */
// `;


// const SignerBox = styled.div`
//   background-color: white;
//   border: 2px solid #007bff;
//   border-radius: 5px;
//   padding: 20px;
//   margin-bottom: 5px;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const SignerInfo = styled.div`
//   flex: 1;
// `;

// const SignerDetail = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px;
// `;

// const SignerName = styled.span`
//   font-weight: bold;
// `;

// const SignerEmail = styled.span`
//   color: #555;
// `;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   font-size: 20px;
//   position: relative;
//   top: -20px;
// `;

// const Footer = styled.footer`
//   background-color: white;
//   padding: 20px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   border-top: 1px solid #ccc;
// `;

// const FooterButtons = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 20px;
// `;

// const NavButton = styled.button`
//   padding: 10px 20px;
//   background-color: #ccc;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
// `;

// const NextButton = styled.button`
//   padding: 10px 20px;
//   background-color:  #03A3FF;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   gap: 10px;
//   cursor: pointer;
// `;

// export default SignerPage;


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

  // 다음 단계로 진행 (서명자 리스트 백엔드로 전송)
  // const handleNextStep = async () => {
  //   try {
  //     const response = await axios.post("http://localhost:8080/api/signature/request", {
  //       documentId: document.id,
  //       signers,
  //     });

  //     if (response.status === 200) {
  //       alert("서명 요청자 지정이 성공적으로 설정되었습니다.");
  //       navigate(`/assign/${document.id}`);
  //     }
  //   } catch (error) {
  //     console.error("서명 요청자 지정 중 오류 발생:", error);
  //   }
  // };
  // 서명 요청이 완료되면 그 때, 전송송

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