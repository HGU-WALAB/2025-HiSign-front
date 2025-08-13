// CompleteButton.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginMemberState } from '../../recoil/atom/loginMemberState';
import { signerState } from '../../recoil/atom/signerState';
import { taskState } from '../../recoil/atom/taskState';
import { NextButton } from "../../styles/CommonStyles";
import ApiService from '../../utils/ApiService';
import ConfirmModal from '../ConfirmModal';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const [document, setDocument] = useRecoilState(taskState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [open, setOpen] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ ConfirmModal 상태
  const [selfIncluded, setSelfIncluded] = useState(false);
  const member = useRecoilValue(loginMemberState);
  const actionLabel = document.type === 1 ? "검토 요청" : "서명 요청";
  const navigate = useNavigate();
  
  const handleOpenModal = () => {
    // 서명 위치 검증은 그대로
    for (const signer of signers) {
      if (!signer.signatureFields || signer.signatureFields.length === 0) {
        alert("모든 서명자에게 서명 위치를 하나 이상 지정해주세요.");
        return;
      }
    }
    const included = signers.some(s => s.email === member.email);
    setSelfIncluded(included)
    setOpen(true); // 먼저 CompleteModal
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  // 공통 업로드 함수: goSignAfter=true면 업로드 직후 서명 화면으로 이동
  const doUpload = async (goSignAfter = false) => {
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
        expirationDateTime: document.expirationDateTime,
        signers: signers
      };
  
      // ✅ fullUpload 호출
      const uploadResponse = await ApiService.fullUpload(file, uploadRequestDTO);

      if (uploadResponse.status === 200) {
        const documentId = uploadResponse.data.documentId;
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
        if (goSignAfter) {
          // 업로드 직후 바로 서명 이동
          try {
            const result = await ApiService.getDocToken(documentId, member.email);
            const token = result.token;
            if (token) {
              navigate(`/checkEmail?token=${token}`);
            } else {
              alert("문서 토큰을 가져오지 못했습니다.");
            }
          } catch (e) {
            console.error("문서 토큰 요청 실패:", e);
            alert("문서 확인 중 오류가 발생했습니다.");
          }
        } else {
          navigate("/request-document");
        }
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
      setShowConfirmModal(false);
    }
  };

// 1단계: CompleteModal 확인 버튼
  const handleCompleteModalConfirm = async () => {
    if (selfIncluded) {
      // 근무일지 본인 포함이면, 우선 안내모달(CompleteModal) 닫고 본인서명 ConfirmModal 띄움
      setOpen(false);
      setShowConfirmModal(true);
      return;
    }
    // 그 외에는 즉시 요청 확정
    await doUpload(false);
  };

  // 2단계: ConfirmModal 확인 버튼 (본인 서명 경로)
  const handleConfirmModalConfirm = async () => {
    await doUpload(true);
  };

  return (
  <>
    <NextButton onClick={handleOpenModal} disabled={loading}>
      완료
    </NextButton>

    <CompleteModal
      open={open}
      onClose={handleCloseModal}
      onConfirm={handleCompleteModalConfirm}
      loading={loading}
      isSelfIncluded={selfIncluded}
    />
    <ConfirmModal
      title="본인 서명이 필요합니다."
      message={
        `본인이 서명자로 지정된 작업입니다.\n` +
        `• 이 작업은 본인 서명을 완료해야 ${actionLabel}을 진행할 수 있습니다.\n` +
        `• 서명을 진행하면 이후에는 내용을 수정할 수 없습니다.\n` +
        `• 서명이 완료되면 즉시 ${actionLabel}이 전송됩니다.\n` +
        `서명을 계속하시겠습니까?`
      }
      warningText={`서명 진행 시 수정 불가 · 서명 완료 후 자동 ${actionLabel} 전송`}
      open={showConfirmModal}
      loading={false}
      onClose={() => {setShowConfirmModal(false);}}
      onConfirm={handleConfirmModalConfirm}
      styleType="SelfIncluded"
    />
  </>
  );
};

export default CompleteButton;

