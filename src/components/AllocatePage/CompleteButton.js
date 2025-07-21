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
  const member = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    for (const signer of signers) {
      if (!signer.signatureFields || signer.signatureFields.length === 0) {
        alert("모든 서명자에게 서명 위치를 하나 이상 지정해주세요.");
        return;
      }
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
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
        // ✅ 현재 사용자가 서명자에 포함되었는지 확인
        const isSelfIncluded = signers.some(signer => signer.email === member.email);
        setSigners([]);
        if (isSelfIncluded) {
          setDocumentId(documentId);
          setShowConfirmModal(true); // ConfirmModal 표시
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
    }
  };

  const handleConfirmModalConfirm = async () => {
    try {
      const result = await ApiService.getDocToken(documentId, member.email);
      const token = result.token;
      if (token) {
        navigate(`/checkEmail?token=${token}`);
      } else {
        alert("문서 토큰을 가져오지 못했습니다.");
      }
    } catch (error) {
      console.error("문서 토큰 요청 실패:", error);
      alert("문서 확인 중 오류가 발생했습니다.");
    }
  };

  return (
  <>
    <NextButton onClick={handleOpenModal} disabled={loading}>
      ㅤ완료ㅤ
    </NextButton> 

    <CompleteModal
      open={open}
      onClose={handleCloseModal}
      onConfirm={handleConfirm}
      loading={loading}
    />
    <ConfirmModal
      title="서명자에 본인이 포함되어 있습니다."
      message="본인이 서명자로 들어가있습니다. 문서에 먼저 서명하시겠습니까?"
      warningText="바로 서명하시는 것을 추천합니다.\n먼저 서명하지 않으시면 검토 단계 이후에 서명이 가능합니다."
      open={showConfirmModal}
      loading={false}
      onClose={() => {
        setShowConfirmModal(false);
        navigate("/request-document");
        }}
      onConfirm={handleConfirmModalConfirm}
    />
  </>
  );
};

export default CompleteButton;

