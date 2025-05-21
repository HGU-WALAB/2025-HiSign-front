// CheckTaskPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import ConfirmModal from "../components/ConfirmModal";
import RejectModal from "../components/ListPage/RejectModal";
import PDFViewer from "../components/SignPage/PDFViewer";
import ApiService from "../utils/ApiService";
import { defaultColors } from "./AllocatePage";

const CheckTaskPage = () => {
  const [signing,setSigning] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [month,setMonth] = useState("");
  const [subject, setSubject] = useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfScale, setPdfScale] = useState(1);
  const [signers, setSigners] = useState([]);

  useEffect(() => {
    ApiService.fetchDocumentInfo(documentId)
    .then(response => {
      //console.log("문서 정보:", response);
      
      // 🔥 여기 추가
      if (response.data.status !== 7) {
        setError("해당 문서는 검토가 필요한 상태가 아닙니다.");
        return; // 나머지 코드 실행 중단
      }

      const partsTitle = response.data.requestName.split("_");
      setUniqueId(partsTitle[3]);
      setSigning((prevState) => ({
        ...prevState,
        requesterName: partsTitle[2],
      }));
      setSubject(partsTitle[0]);
      setMonth(partsTitle[1]);
    })
    .catch(error => {
      setError('문서 제목을 로드하는 중 오류가 발생했습니다: ' + error.message);
    });

    ApiService.fetchDocument(documentId)
      .then(response => {
        const fileBlob = new Blob([response.data], { type: 'application/pdf' });
        setSigning((prevState) => ({
          ...prevState,
          fileUrl: URL.createObjectURL(fileBlob),
          documentId: documentId,
        }));
      })
      .catch(error => {
        setError('문서를 로드하는 중 오류가 발생했습니다: ' + error.message);
      });
  
    ApiService.fetchSignersByDocument(documentId)
    .then((response) => {
      const signerList = response;

      // 서명자별 필드 로딩
      Promise.all(
        signerList.map(async (signer, idx) => {
          const { data: fields } = await ApiService.fetchSignatureFields(documentId, signer.email);
          return {
            ...signer,
            color: defaultColors[idx % defaultColors.length],
            signatureFields: fields,
          };
        })
      )
        .then((signersWithFields) => {
          setSigners(signersWithFields);
        })
        .catch((error) => {
          console.error("🔴 서명 필드 로딩 실패:", error);
          setError("서명 필드를 불러오는 중 오류가 발생했습니다.");
        });
    })
    .catch((error) => {
      console.error("🔴 서명자 정보 로딩 실패:", error);
      setError("서명자 정보를 로드하는 중 오류가 발생했습니다.");
    });
  }, [documentId]);

  const handleOpenModal = () => {
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirm= async  () => {
    setLoading(true);
    try {
      for (const signer of signers) {
        await ApiService.sendRequestMail(signing.documentId, signer.name);
      }
      alert("서명 요청이 성공적으로 전송되었습니다.");
      navigate("/admin-document");
    } catch (error) {
      console.error(error);
      alert("서명 요청 전송에 실패했습니다.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleReject = () => {
    setRejectReason("");
    setShowModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      await ApiService.rejectCheck(signing.documentId, rejectReason);
      alert("요청이 반려되었습니다.");
      setShowModal(false);
      navigate("/");
    } catch (error) {
      console.error("요청 반려 중 오류 발생:", error);
      alert("요청 반려에 실패했습니다.");
    } finally {
      setLoading(false); // 성공/실패 모두 로딩 해제
    }
  };

  if (error) {
    return (
      <MainContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </MainContainer>
    );
  }

  return (
    
    <MainContainer>
      <ContentWrapper>
        <Sidebar>
          <InfoSection>
            <InfoItem>
              <Label>TA 학번:</Label>
              <Value>{uniqueId || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>TA 이름:</Label>
              <Value>{signing.requesterName || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>교과목:</Label>
              <Value>{subject || "알 수 없음"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>기준 월:</Label>
              <Value>{month|| "알 수 없음"}</Value>
            </InfoItem>
            {signers.length > 0 ? (
              signers.map((signer, idx) => (
                <InfoItem key={signer.email}>
                  <Label>서명자 {idx + 1}:</Label>
                  <Value style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ColorDot style={{ backgroundColor: signer.color }} />
                    <span>{signer.name}</span>
                  </Value>
                </InfoItem>
              ))
            ) : (
              <InfoItem>
                <Label>서명자:</Label>
                <Value>알 수 없음</Value>
              </InfoItem>
            )}
          </InfoSection>

          <ButtonContainer>
            <RejectButton onClick={handleReject}>요청 반려</RejectButton>
            <NextButton onClick={handleOpenModal}>요청 승인</NextButton>
          </ButtonContainer>
        </Sidebar>

        <PDFWrapper>
          {signing.fileUrl && signers.length !== 0 ? (
            <DocumentContainer>
              <PDFViewer
                pdfUrl={signing.fileUrl}
                setCurrentPage={setCurrentPage}
                onScaleChange={setPdfScale}
                type={"check"}
                signers={signers}
              />
            </DocumentContainer>
          ) : (
            <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
          )}
        </PDFWrapper>
      </ContentWrapper>

      <RejectModal
        isVisible={showModal}
        loading={loading}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        type={"return"}
      />

      <ConfirmModal
        open={open}
        loading={loading}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title="요청 승인"
        message="이 작업을 승인하시겠습니까?"
      />
    </MainContainer>
  );
};

export default CheckTaskPage;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;

`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
`;

const Sidebar = styled.div`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
`;

const PDFWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
`;

const InfoSection = styled.div`
  width: 100%;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

const Label = styled.span`
  font-weight: bold;
`;

const Value = styled.span`
  color: #333;
`;

const DocumentContainer = styled.div`
  max-width: 70vw;
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
`;

const LoadingMessage = styled.p`
  color: #666;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const NextButton = styled(ButtonBase)`
  background-color: #03A3FF;
  color: white;
  margin-left: 10px;
  &:hover {
    background-color: rgba(3, 163, 255, 0.66);
  }
`;

const RejectButton = styled(ButtonBase)`
  background-color: rgb(255, 0, 0);
  color: white;
  &:hover {
    background-color: rgb(179, 0, 0);
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
  background-color: #fff3f3;
  border: 1px solid #ff4d4f;
  padding: 10px 15px;
  border-radius: 5px;
  text-align: center;
  margin: 10px auto;
  width: 80%;
  max-width: 500px;
  box-shadow: 0px 2px 8px rgba(255, 77, 79, 0.2);
`;

const ColorDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #aaa;
`;