const FileService = {
  /**
   * 🔹 Base64 → Blob 변환
   * @param {string} base64 - Base64 인코딩된 이미지 문자열
   * @returns {Blob} 변환된 Blob 객체
   */
  base64ToBlob: (base64) => {
    if (!base64 || !base64.startsWith("data:image")) {
      throw new Error("올바른 Base64 이미지 데이터가 아닙니다.");
    }

    const byteCharacters = atob(base64.split(",")[1]); // Base64 디코딩
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/png" }); // Blob 생성
  }
};

export default FileService;
