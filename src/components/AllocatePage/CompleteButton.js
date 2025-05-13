// CompleteButton.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { loginMemberState } from '../../recoil/atom/loginMemberState';
import { signerState } from '../../recoil/atom/signerState';
import { taskState } from '../../recoil/atom/taskState';
import ApiService from '../../utils/ApiService';
import ButtonBase from '../ButtonBase';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const [document, setDocument] = useRecoilState(taskState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  const member = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (!document.fileUrl) {
        alert("업로드할 파일을 선택해주세요.");
        return;
      }
  
      // 파일을 불러오기
      const response = await fetch(document.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], document.fileName, { type: blob.type });
  
      // UploadRequestDTO 준비
      const uploadRequestDTO = {
        uniqueId: member.uniqueId,    // ✅ 업로더 고유 ID
        requestName: document.requestName,
        description: document.description,
        isRejectable: document.isRejectable,
        type: document.type,
        password: document.password,
        memberName: member.name,
        signers: signers
      };
  
      // ✅ fullUpload 호출
      const uploadResponse = await ApiService.fullUpload(file, uploadRequestDTO);
  
      if (uploadResponse.status === 200) {
        alert("성공적으로 요청되었습니다.");
        setDocument({
          requestName: "",
          description: "",
          ownerId: null,
          fileName: null,
          fileUrl: "",
          file: null,
          isRejectable: null,
          fileType: null,
        });
        setSigners([]);
        navigate("/request-document");
      } else {
        console.error("요청 실패:", uploadResponse);
        alert("요청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("요청 처리 중 오류 발생:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
   <>
  <CompleteButtonStyle onClick={handleOpenModal} disabled={loading}>
    완료
  </CompleteButtonStyle>

  <CompleteModal
    open={open}
    onClose={handleCloseModal}
    onConfirm={handleConfirm}
    loading={loading}
  />
</>

  );
  
};

export default CompleteButton;

// const BigButton = styled(ButtonBase)`
//   background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
//   font-size: 1rem;
//   font-weight: bold;
// `;


const CompleteButtonStyle = styled(ButtonBase)`

  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  color: white;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 24px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  border: none;

  
`;


