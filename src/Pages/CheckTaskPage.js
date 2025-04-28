// CheckTaskPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import ButtonBase from "../components/ButtonBase";
import RejectModal from "../components/ListPage/RejectModal";
import SignatureMarker from "../components/PreviewPage/SignatureMarker";
import PDFViewer from "../components/SignPage/PDFViewer";
import { signingState } from "../recoil/atom/signingState";
import ApiService from "../utils/ApiService";

const CheckTaskPage = () => {
  const [signing,setSigning] = useRecoilState(signingState);
  const [uniqueId, setUniqueId] = useState("");
  const [month,setMonth] = useState("");
  const [subject, setSubject] = useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
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
      .then(response => {
        console.log("서명자 정보:", response);
        setSigning((prevState) => ({
          ...prevState,
          signerName: response[0]?.name || "",
          signerEmail: response[0]?.email || "",
        }));
        
        ApiService.fetchSignatureFields(documentId,response[0]?.email)
          .then(response => {
            console.log("서명 필드 정보:", response);
            setSigning((prevState) => ({
              ...prevState,
              signatureFields: response.data,
            }));
          })
          .catch(error => {
            setError('서명 필드를 로드하는 중 오류가 발생했습니다: ' + error.message);
          });
      })
      .catch(error => {
        setError('서명자 정보를 로드하는 중 오류가 발생했습니다: ' + error.message);
      });

      ApiService.fetchDocumentTitle(documentId)
      .then(response => {
        console.log("문서 제목:", response);
        const partsTitle = response.split("_");
        setUniqueId(partsTitle[3]);
        setSigning((prevState) => ({
          ...prevState,
          requesterName: partsTitle[2],
        }));
        setSubject(partsTitle[0]);
        setMonth(partsTitle[1]);
      }).catch(error => {
        setError('문서 제목을 로드하는 중 오류가 발생했습니다: ' + error.message);
      });
  }, [documentId]);

  const handleConfirm= () => {
    ApiService.sendSignatureRequest(signing.documentId, signing.requesterName, signing.signerEmail, signing.token)
      .then(() => {
        alert("서명 요청이 성공적으로 전송되었습니다.");
        navigate("/");
      })
      .catch((error) => {
        console.error("서명 요청 전송 중 오류 발생:", error);
        alert("서명 요청 전송에 실패했습니다.");
      });
  };

  const handleReject = () => {
    setRejectReason("");
    setShowModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    ApiService.rejectDocument(signing.documentId, rejectReason, signing.token, signing.signerEmail)
      .then(() => {
        alert("요청이 반려되었습니다.");
        setShowModal(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("요청 반려 중 오류 발생:", error);
        alert("요청 반려에 실패했습니다.");
      });
  };

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
            <InfoItem>
              <Label>담당 교수:</Label>
              <Value>{signing.signerName || "알 수 없음"}</Value>
            </InfoItem>
          </InfoSection>

          <ButtonContainer>
            <RejectButton onClick={handleReject}>서명 요청 반려</RejectButton>
            <NextButton onClick={handleConfirm}>서명 요청 전달</NextButton>
          </ButtonContainer>
        </Sidebar>

        <PDFWrapper>
          {signing.fileUrl && signing.signatureFields ? (
            <DocumentContainer>
              <PDFViewer
                pdfUrl={signing.fileUrl}
                setCurrentPage={setCurrentPage}
              />
              <SignatureMarker currentPage={currentPage} />
            </DocumentContainer>
          ) : (
            <LoadingMessage>문서 및 서명 정보를 불러오는 중...</LoadingMessage>
          )}
        </PDFWrapper>
      </ContentWrapper>

      <RejectModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
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
  padding-top: 80px;
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
  max-width: 800px;
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