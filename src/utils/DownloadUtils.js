import ApiService from "../utils/ApiService";

/**
 * 단일 문서 PDF 다운로드
 * @param {number} documentId
 */
export const downloadPDF = async (documentId) => {
  try {
    // 1. 파일명 먼저 가져오기
    const infoRes = await ApiService.fetchDocumentInfo(documentId);
    const fileName = infoRes.data.requestName || `document_${documentId}.pdf`;

    // 2. 파일 본문 다운로드
    const fileRes = await ApiService.downloadSingleDocument(documentId);
    const blob = new Blob([fileRes.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("문서 다운로드 실패:", error);
    alert("문서 다운로드 중 오류가 발생했습니다.");
  }
};

/**
 * 선택된 문서들을 ZIP으로 다운로드
 * @param {number[]} documentIds
 */
export const downloadZip = async (documentIds) => {
  try {
    const response = await ApiService.downloadDocumentsAsZip(documentIds);

    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "documents.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("ZIP 다운로드 실패:", error);
    alert("ZIP 파일 다운로드 중 오류가 발생했습니다.");
  }
};