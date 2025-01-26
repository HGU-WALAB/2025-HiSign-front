import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { documentState } from '../../recoil/atom/documentState';
import { signerState } from '../../recoil/atom/signerState';
import ApiService from '../../utils/ApiService';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const [document, setDocument]= useRecoilState(documentState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    // 완료 처리 로직 추가 가능 (예: API 호출)
    try {
      // 상태 확인
      const response = await ApiService.sendSignatureRequest(document.id,signers);
  
      if (response.status === 200) {
        alert("서명 요청이 성공적으로 전송되었습니다.");
        navigate('/list');
      }
    } catch (error) {
      console.error("서명 요청 중 오류 발생:", error);
    }
    
    setDocument({
      id: null,
      name: '',
      fileUrl: null,
    });
    setSigners([]);

    console.log("요청이 완료되었습니다.");
    setOpen(false);
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
