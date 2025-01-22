// 필요한 라이브러리 및 컴포넌트 임포트
import axios from "axios";
import { useRecoilState } from "recoil";
import Drop from "../components/Drop";
import { PageContainer } from "../components/PageContainer";
import { documentState } from "../recoil/atom/documentState";
import { blobToURL } from "../utils/Utils";


const UploadPage = () => {
  // 스타일 정의
  const styles = {
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
  };

  // 상태 관리
  const [document, setDocumentState] = useRecoilState(documentState); // 현재 PDF 파일

  const handlePostFiles = (file) => {
    if (!file) {
      alert("업로드할 파일이 없습니다.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file, file.name); // 파일 추가
  
    axios
      .post("http://localhost:8080/api/files/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("파일 업로드 완료!");
        console.log("Response Data:", response.data);
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
        {!document ? (
          <Drop
            onLoaded={async (files) => {
              const file = files[0];
              if (file) {
                handlePostFiles(file);
                const URL = await blobToURL(file);
                setDocumentState(URL);
              }
            }}
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p>파일이 성공적으로 업로드되었습니다.</p>
            <button onClick={() => setDocumentState(null)}>다른 파일 업로드</button>

          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default UploadPage;