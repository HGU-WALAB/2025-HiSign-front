// 필요한 라이브러리 및 컴포넌트 임포트
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import Drop from "../components/Drop";
import { PageContainer } from "../components/PageContainer";
import { documentState } from "../recoil/atom/documentState";
import { memberState } from "../recoil/atom/memberState";
import ApiService from "../utils/ApiService";

const UploadPage = () => {
  // 스타일 정의
  const styles = {
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      marginTop: 20,
      gap: "20px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "16px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  // 상태 관리
  const [document, setDocumentState] = useRecoilState(documentState); // 현재 PDF 파일
  const member = useRecoilValue(memberState); // 현재 사용자 정보
  const navigate = useNavigate();

  const handlePostFiles = (file) => {
    if (!file) {
      alert("");
      return;
    }
    console.log("before API, file:", file);
    ApiService.uploadDocument(file,member.unique_id)
      .then((response) => {
        alert("파일 업로드 완료!");
        console.log("Response Data:", response.data);
        console.log("Aftoer API, file:", file);
        const blobUrl = URL.createObjectURL(file);
        // 서버에서 받은 데이터를 상태에 저장 (예: id, name 등)
        setDocumentState({
          id: response.data.id,
          name: response.data.fileName,
          fileUrl: blobUrl,
        });
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        alert(`파일 업로드 실패: ${error.response?.data?.message || error.message}`);
      });
  };

  return (
    <PageContainer>
      <div style={styles.container}>
        {/* PDF 파일 드롭 영역 */}
        {!document.fileUrl ? (
          <Drop
            onLoaded={async (files) => {
              const file = files[0];
              if (file) {
                handlePostFiles(file);
              }
            }}
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p>{document.name} 파일이 성공적으로 업로드되었습니다.</p>
            <div style={styles.buttonContainer}>
              <button
                style={styles.button}
                onClick={() => setDocumentState({ id: null, name: "", fileUrl: null })}
              >
                다른 파일 업로드
              </button>
              <button
                style={styles.button}
                onClick={() => navigate("/request")}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default UploadPage;
