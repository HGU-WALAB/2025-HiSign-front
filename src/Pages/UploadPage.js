// // 필요한 라이브러리 및 컴포넌트 임포트
// import { useNavigate } from "react-router-dom";
// import { useRecoilState, useRecoilValue } from "recoil";
// import Drop from "../components/Drop";
// import { PageContainer } from "../components/PageContainer";
// import { documentState } from "../recoil/atom/documentState";
// import { memberState } from "../recoil/atom/memberState";
// import apiWithAuth from "../utils/apiWithAuth";
// const UploadPage = () => {
//   // 스타일 정의
//   const styles = {
//     container: {
//       maxWidth: 900,
//       margin: "0 auto",
//     },
//   };

//   // 상태 관리
//   const [document, setDocumentState] = useRecoilState(documentState); // 현재 PDF 파일
//   const member = useRecoilValue(memberState); // 현재 사용자 정보
//   console.log("member:", member);
//   const navigate = useNavigate();

//   const handlePostFiles = (file) => {
//     if (!file) {
//       alert("업로드할 파일이 없습니다.");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append("file", file, file.name); // 파일 추가
//     formData.append("unique_id", member.unique_id); // 파일 소유자 추가
  
//     apiWithAuth
//       .post("/files/document/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       .then((response) => {
//         alert("파일 업로드 완료!");
//         console.log("Response Data:", response.data);
  
//         // 서버에서 받은 데이터를 상태에 저장 (예: id, name 등)
//         setDocumentState({
//           id: response.data.id,
//           name: response.data.fileName,
//           file: file,
//         });
//       })
//       .catch((error) => {
//         console.error("Error uploading file:", error);
//         alert(`파일 업로드 실패: ${error.response?.data?.message || error.message}`);
//       });
//   };
  

//   return (
//     <PageContainer>
//       <div style={styles.container}>
//         {/* PDF 파일 드롭 영역 */}
//         {!document.file ? (
//           <Drop
//             onLoaded={async (files) => {
//               const file = files[0];
//               if (file) {
//                 handlePostFiles(file);
//               }
//             }}
//           />
//         ) : (
//           <div style={{ textAlign: "center", marginTop: 20 }}>
//             <p>{document.name} 파일이 성공적으로 업로드되었습니다.</p>
//             <button onClick={() => setDocumentState({ id: null, name: '', file: null })}>다른 파일 업로드</button>

//           </div>
//         )}
//       </div>
//     </PageContainer>
//   );
// }

// export default UploadPage;

// 필요한 라이브러리 및 컴포넌트 임포트
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import Drop from "../components/Drop";
import { PageContainer } from "../components/PageContainer";
import { documentState } from "../recoil/atom/documentState";
import { memberState } from "../recoil/atom/memberState";
import apiWithAuth from "../utils/apiWithAuth";
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
  const member = useRecoilValue(memberState); // 현재 사용자 정보
  console.log("member:", member);
  const navigate = useNavigate();

  const handlePostFiles = (file) => {
    if (!file) {
      alert("업로드할 파일이 없습니다.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file, file.name); // 파일 추가
    formData.append("unique_id", member.unique_id); // 파일 소유자 추가
  
    apiWithAuth
      .post("/files/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("파일 업로드 완료!");
        console.log("Response Data:", response.data);
  
        // 서버에서 받은 데이터를 상태에 저장 (예: id, name 등)
        setDocumentState({
          id: response.data.id,
          name: response.data.fileName,
          file: file,
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
        {!document.file ? (
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
            <button onClick={() => setDocumentState({ id: null, name: '', file: null })}>다른 파일 업로드</button>

          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default UploadPage;