import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { documentState } from '../../recoil/atom/documentState';
import { signatureState } from '../../recoil/atom/signatureState';
import { signerState } from '../../recoil/atom/signerState';
import apiWithAuth from '../../utils/apiWithAuth';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const document = useRecoilValue(documentState);
  const signers = useRecoilValue(signerState);
  const signatureFields = useRecoilValue(signatureState);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    console.log("요청이 완료되었습니다.");
    setOpen(false);
    // 완료 처리 로직 추가 가능 (예: API 호출)
    try {
      // 상태 확인
      if (!document?.id) {
        alert("문서 정보가 없습니다.");
        return;
      }
      if (signers.length === 0) {
        alert("서명자를 추가해주세요.");
        return;
      }
      if (signatureFields.length === 0) {
        alert("서명 위치를 지정해주세요.");
        return;
      }
      const requestData = {
        documentId: document.id,
        signers,
        signatureFields,
      };
  
      const response = await apiWithAuth.post('/signature-requests/request', requestData);
  
      if (response.status === 200) {
        alert("서명 요청이 성공적으로 전송되었습니다.");
        navigate('/list');
      }
    } catch (error) {
      console.error("서명 요청 중 오류 발생:", error);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        완료
      </Button>

      <CompleteModal open={open} onClose={handleCloseModal} onConfirm={handleConfirm} />
    </>
  );
};

export default CompleteButton;
