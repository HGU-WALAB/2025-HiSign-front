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
  const member = useRecoilValue(loginMemberState);
  const navigate = useNavigate();

  // 모달 열기
  const handleOpenModal = () => {
    setOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setOpen(false);
  };

  // 문서 업로드 후 서명 요청을 순차적으로 실행
  const handleConfirm = async () => {
    if (!document.fileUrl) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    try {
      // 1 파일 변환: Blob URL → File
      const response = await fetch(document.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], document.fileName, { type: blob.type });

      console.log("파일 변환 완료:", file);
      console.log("문서 정보:", document);
      // 2 문서 업로드 API 호출 (순차 실행 보장)
      const uploadResponse = await ApiService.uploadDocument(file, document.ownerId, document.requestName, document.description, document.isRejectable, document.type);

      if (uploadResponse.status !== 200) {
        throw new Error("문서 업로드에 실패했습니다.");
      }

      console.log("문서 업로드 성공:", uploadResponse.data);
      console.log("document : ", document);
      console.log("document.passaword 타입:", typeof document.password);
      console.log("document.passaword:", document.password);
      const documentId = uploadResponse.data.documentId;
      
      // 3 서명 요청 API 호출 (업로드 완료 후 실행)
      const signatureResponse = await ApiService.sendSignatureRequest(documentId, member.name, signers, document.password);
      
      console.log("서명 요청 결과:", signatureResponse);

      if (signatureResponse.status === 200) {
        alert("서명 요청이 성공적으로 전송되었습니다.");
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
          console.error("서명 요청 실패:", signatureResponse);
          alert("서명 요청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("요청 처리 중 오류 발생:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <BigButton variant="contained" color="primary" onClick={handleOpenModal}>
        완료
      </BigButton>

      <CompleteModal open={open} onClose={handleCloseModal} onConfirm={handleConfirm} />
    </>
  );
};

export default CompleteButton;

const BigButton = styled(ButtonBase)`
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "#03A3FF")};
  font-size: 1rem;
  font-weight: bold;
`;