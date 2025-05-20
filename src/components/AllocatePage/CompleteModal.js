// CompleteModal.js
import { Box, Button, Modal, Typography } from '@mui/material';
import { BeatLoader } from "react-spinners";
import { useRecoilValue } from 'recoil';
import { taskState } from '../../recoil/atom/taskState';

const CompleteModal = ({ open, onClose, onConfirm, loading}) => {
  const document = useRecoilValue(taskState);

  const handleConfirm = async () => {
    await onConfirm(); // 상위에서 비동기 처리, 로딩은 상위가 관리
  };

  const confirmMessage =
    document.type === 1
      ? "검토 요청을 보내시겠습니까?"
      : "요청을 완료하시겠습니까?";

  const warningText = "*요청을 보내시면 수정이 불가합니다.";

  return (
    <>
      {/* 요청 확인 모달 (로딩 아닐 때만) */}
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
          {/* 근무일지 안내 */}
          {document.type === 1 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                📝 근무일지 작성 시 확인사항
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body2" gutterBottom>• 본인 수업시간 및 주말 또는 휴일 제외하여 근무일지 작성</Typography>
                <Typography variant="body2" gutterBottom>• 늦은밤이나 새벽시간 근무일시에서 제외하여 기재해야함</Typography>
                <Typography variant="body2" gutterBottom>• 시험감독, 채점, 과제체크(확인) 등 교수 본연의 업무에 해당되는 내용 작성 금지</Typography>
                <Typography variant="body2" gutterBottom>• 본인의 월 근로시간 확인 후 맞게 작성(초과작성 불가)</Typography>
              </Box>
            </>
          )}

          {/* 확인 질문 */}
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {confirmMessage}
          </Typography>

          {/* 공통 경고 문구 */}
          <Typography variant="caption" sx={{ color: 'red', display: 'block', mb: 1 }}>
            {warningText}
          </Typography>

          {/* 버튼 영역 (반응형 적용) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '10px',
            }}
          >
            {[['취소', onClose], ['확인', handleConfirm]].map(([label, handler]) => (
              <Button
                key={label}
                onClick={handler}
                disableElevation
                sx={{
                  backgroundColor: label === '취소' ? 'white' : '#03A3FF',
                  color: label === '취소' ? '#03A3FF' : 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                  border:'2px solid #03A3FF',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: label === '취소' ? '#f0f8ff' : '#0393e6',
                    color: label === '취소' ? '#03A3FF' : 'white',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </Box>
      </Modal>

      {/* 로딩 모달 (반응형 적용) */}
      <Modal open={loading}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '80%', sm: 300 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
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