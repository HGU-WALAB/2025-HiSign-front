import { Box, Button, Modal, Typography } from '@mui/material';
import React from 'react';

const CompleteModal = ({ open, onClose, onConfirm }) => {
  return (
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
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          요청을 완료하시겠습니까?
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            확인
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            취소
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
export default CompleteModal;

