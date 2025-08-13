import {
    Box, Button,
    CircularProgress,
    Modal,
    Paper,
    Switch,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { PageContainer } from "../components/PageContainer";
import ApiService from "../utils/ApiService";

const MemberManage = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: "", email: "", uniqueId: "" });
    const [bulkInput, setBulkInput] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchMembers = async () => {
        try {
            const res = await ApiService.fetchMembers();
            setMembers(res.data);
        } catch (e) {
            alert("회원 목록 불러오기 실패");
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleActiveToggle = async (uniqueId, active) => {
        try {
            await ApiService.updateMemberActive(uniqueId, active);
            fetchMembers();
        } catch (e) {
            alert("활성화 상태 업데이트 실패");
        }
    };

    const handleAddMember = async () => {
        const { name, email, uniqueId } = newMember;
        if (!name || !email || !uniqueId) return alert("모든 필드를 입력해주세요.");

        try {
            setLoading(true);
            await ApiService.addMember(newMember);
            alert("회원 추가 완료");
            handleCloseAddModal(); // 모달 닫기 + 입력값 초기화
            fetchMembers();
        } catch (e) {
            alert("회원 추가 실패: " + (e.response?.data?.error || e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = async () => {
        if (!bulkInput.trim()) return alert("내용을 입력해주세요.");
        try {
            setLoading(true);
            const res = await ApiService.bulkAddMembers(bulkInput);
            alert(`총 ${res.data.totalCount}명 중 ${res.data.successCount}명 추가됨`);
            handleCloseBulkModal(); // 모달 닫기 + 입력값 초기화
            fetchMembers();
        } catch (e) {
            alert("일괄 추가 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setNewMember({ name: "", email: "", uniqueId: "" });
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setNewMember({ name: "", email: "", uniqueId: "" });
        setShowAddModal(false);
    };

    const handleOpenBulkModal = () => {
        setBulkInput("");
        setShowBulkModal(true);
    };

    const handleCloseBulkModal = () => {
        setBulkInput("");
        setShowBulkModal(false);
    };

    const filteredMembers = members
        .filter((m) => !(m.uniqueId?.startsWith("1") || m.uniqueId?.startsWith("5") || m.uniqueId?.startsWith("7")))
        .filter((m) => m.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (a.active !== b.active) {
                return a.active ? -1 : 1;
            }
            return a.name.localeCompare(b.name, 'ko');
        });


    return (
        <PageContainer>
            <Box px={{ xs: 2, sm: 6, md: 20 }}>
                <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", paddingTop: "1rem" }}>
                    사용자 관리
                </h1>

                {/* 검색창 + 버튼 영역 */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                    mb={2}
                >
                    <TextField
                        placeholder="이름 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{
                            width: { xs: 160, sm: 180, md: 200 },
                            "& .MuiInputBase-root": {
                                height: 33
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleOpenAddModal}
                        sx={{ height: 33, minWidth: 100, fontSize: "0.9rem" }}
                    >
                        사용자 추가
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleOpenBulkModal}
                        sx={{ height: 33, minWidth: 100, fontSize: "0.9rem" }}
                    >
                        일괄 추가
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" sx={{ pr: 0 }}>TA 활성화</TableCell>
                                <TableCell sx={{ pr: 0 }}>이름</TableCell>
                                <TableCell>학번</TableCell>
                                <TableCell>이메일</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMembers.map((m) => (
                                <TableRow key={m.uniqueId} hover>
                                    <TableCell align="left" sx={{ pr: 0}}>
                                        <Switch
                                            checked={m.active}
                                            onChange={(e) => handleActiveToggle(m.uniqueId, e.target.checked)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ pr: 0 }}>
                                        <Typography fontWeight="bold">{m.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {m.active ? "TA" : "학생"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{m.uniqueId}</TableCell>
                                    <TableCell>{m.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
            </Box>

            <Modal open={showAddModal} onClose={handleCloseAddModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>회원 추가</Typography>
                    <TextField fullWidth margin="normal" label="이름" value={newMember.name}
                               onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                    <TextField fullWidth margin="normal" label="학번" value={newMember.uniqueId}
                               onChange={(e) => setNewMember({ ...newMember, uniqueId: e.target.value })} />
                    <TextField fullWidth margin="normal" label="이메일" value={newMember.email}
                               onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button onClick={handleCloseAddModal}>취소</Button>
                        <Button variant="contained" onClick={handleAddMember} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "추가"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Modal open={showBulkModal} onClose={handleCloseBulkModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>일괄 추가</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        • 작성요령 <br/>
                        - 공백으로 구분하여 이름 학번 이메일 기입 해주세요<br/>
                        - 다음학생은 다음 줄에 기입해주세요<br/>
                        예시) <br/>
                        김한동 22512345 handong30@handong.ac.kr<br />
                        이갈대 22512346 galdae30@handong.ac.kr<br />
                        박상자 22512347 box30@handong.ac.kr<br />
                        <br />
                        • 주의사항<br />
                        - 추가된 사용자는 자동으로 TA로 활성화됩니다.<br />
                        - 이미 존재하던 사용자는 추가되지 않고 TA로 활성화됩니다.<br />
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                    />
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button onClick={handleCloseBulkModal}>취소</Button>
                        <Button variant="contained" color="primary" onClick={handleBulkAdd} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "일괄 추가"}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </PageContainer>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #ccc',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default MemberManage;

