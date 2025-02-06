import { Box, Button, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BeatLoader } from "react-spinners";

const CompleteModal = ({ open, onClose, onConfirm }) => {
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  const handleConfirm = () => {
    onClose(); // 첫 번째 모달 닫기
    setLoadingModalOpen(true); // 두 번째 모달 열기

    onConfirm(); // 비동기 작업 실행 (필요하면 수정)

    // 3초 후 자동으로 닫히도록 설정
    setTimeout(() => {
      setLoadingModalOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* 첫 번째 모달 */}
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            요청을 완료하시겠습니까?
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              확인
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              취소
            </Button>
          </div>
        </Box>
      </Modal>

      {/* 두 번째 모달 (로딩) */}
      <Modal open={loadingModalOpen} onClose={() => {}}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            잠시만 기다려주세요!
          </Typography>
          <BeatLoader />
        </Box>
      </Modal>
    </>
  );
};

export default CompleteModal;
