// CompleteButton.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { loginMemberState } from '../../recoil/atom/loginMemberState';
import { signerState } from '../../recoil/atom/signerState';
import { taskState } from '../../recoil/atom/taskState';
import ApiService from '../../utils/ApiService';
import ButtonBase from '../ButtonBase';
import CompleteModal from './CompleteModal';

const CompleteButton = () => {
  const [document, setDocument] = useRecoilState(taskState);
  const [signers, setSigners] = useRecoilState(signerState);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
  const member = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true); // 로딩 시작
    try {
      if (!document.fileUrl) {
        alert("업로드할 파일을 선택해주세요.");
        return;
      }

      const response = await fetch(document.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], document.fileName, { type: blob.type });

      const uploadResponse = await ApiService.uploadDocument(
        file,
        document.ownerId,
        document.requestName,
        document.description,
        document.isRejectable,
        document.type
      );

      if (uploadResponse.status !== 200) {
        throw new Error("문서 업로드에 실패했습니다.");
      }

      const documentId = uploadResponse.data.documentId;

      let signatureResponse;
      try {
        if (document.type === 1) {
          await ApiService.reqeustCheckTask(documentId);
          signatureResponse = await ApiService.storeSignatureRequest(documentId, member.name, signers, document.password);
        } else {
          signatureResponse = await ApiService.sendSignatureRequest(documentId, member.name, signers, document.password);
        }
      } catch (error) {
        console.error("서명 요청 처리 중 오류:", error);
        alert(error.response?.data?.message || "서명 요청 중 오류가 발생했습니다.");
      }

      if (signatureResponse.status === 200) {
        alert("성공적으로 요청청되었습니다.");
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
        navigate("/request-document");
      } else {
        console.error("요청 실패:", signatureResponse);
        alert("요청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("요청 처리 중 오류 발생:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false); // ✅ 로딩 끝
      setOpen(false); // 모달 닫기
    }
  };

  return (
    <>
      <BigButton variant="contained" color="primary" onClick={handleOpenModal}>
        완료
      </BigButton>

      <CompleteModal
        open={open}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        loading={loading} // ✅ 로딩 상태 전달
      />
    </>
  );
};

export default CompleteButton;

const BigButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  font-size: 1rem;
  font-weight: bold;
`;