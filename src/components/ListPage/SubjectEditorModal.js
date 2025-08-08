import { Box, Button, CircularProgress, Modal, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ApiService from '../../utils/ApiService';

const SubjectEditorModal = ({ open, onClose }) => {
    const [subjectText, setSubjectText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setIsLoading(true);  // 🔹 시작 시 true
            ApiService.getSubjects()
            .then((data) => {
                setSubjectText(data.join('\n'));
                setIsLoading(false); // 🔹 완료 시 false
            })
            .catch(() => {
                alert('과목 목록을 불러오지 못했습니다.');
                setIsLoading(false);
            });
        }
    }, [open]);

    const handleConfirmSave = async () => {
        const cleanedText = subjectText
            .split('\n')
            .map(line => line.trim()) // 공백 제거
            .filter(line => line.length > 0) // 빈 줄 제거
            .join('\n');
        try {
            await ApiService.saveSubjects(cleanedText);
            alert('과목 목록이 저장되었습니다.');
            onClose();
        } catch {
            alert('저장에 실패했습니다.');
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                width: "90%",
                maxWidth: "600px",
                minWidth: "280px",
                borderRadius: "8px"
            }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    과목 목록 수정
                </Typography>
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                        <CircularProgress size={20} />
                        <span style={{ fontStyle: "italic" }}>목록을 불러오는 중입니다...</span>
                        </div>
                    </div>
                    ) : (
                    <textarea
                        value={subjectText}
                        onChange={(e) => setSubjectText(e.target.value)}
                        rows={15}
                        style={{ width: '100%', padding: '10px', fontSize: '14px', lineHeight: '1.5' }}
                    />
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}>
                    <Button variant="outlined" onClick={onClose}>취소</Button>
                    <Button variant="contained" onClick={handleConfirmSave} disabled={isLoading}>
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
export default SubjectEditorModal;
