import { Button } from '@mui/material';
import React, { useState } from 'react';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    console.log("요청이 완료되었습니다.");
    setOpen(false);
    // 완료 처리 로직 추가 가능 (예: API 호출)
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
