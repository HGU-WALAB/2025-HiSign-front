// ConfirmModal.js
import { Box, Button, Modal, Typography } from '@mui/material';
import { BeatLoader } from "react-spinners";

const ConfirmModal = ({
  open,
  loading,
  onClose,
  onConfirm,
  title,
  message,
  warningText,
  styleType = "default"
}) => {

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <>
      {/* 확인 모달 */}
      <Modal open={open && !loading} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500, md: 550 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {title && (
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {title}
            </Typography>
          )}

          {styleType === "SelfIncluded" ? (
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                {message}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
              {message}
            </Typography>
          )}

          <Typography variant="caption" sx={{ color: 'red', display: 'block', mb: 3 }}>
            {warningText}
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            
            <Button variant="outlined" color="grey" onClick={onClose}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              확인
            </Button>
          </div>
        </Box>
      </Modal>

      {/* 로딩 모달 */}
      <Modal open={loading}>
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            처리 중입니다...
          </Typography>
          <BeatLoader />
        </Box>
      </Modal>
    </>
  );
};

export default ConfirmModal;
