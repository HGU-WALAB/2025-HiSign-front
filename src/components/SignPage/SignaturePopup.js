import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { BigButton } from "../BigButton";

const SignaturePopup = ({ field, fieldIndex, onClose, onSave, applyToAll = false }) => {
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null); // ✅ 파일 input 참조
  const [uploadedImage, setUploadedImage] = useState(null);
  // ✅ 팝업 기준 내부 여백 고려한 최대 가용 너비
  const popupMaxWidth = 500;
  const popupPadding = 40; // 좌우 총합
  const rawAvailableWidth = Math.min(window.innerWidth * 0.9, popupMaxWidth);
  const canvasWidth = rawAvailableWidth - popupPadding; // ✅ 실제 콘텐츠 너비
  const canvasHeight = canvasWidth / 2;
  
  const handleSave = () => {
    if (uploadedImage) {
      onSave(uploadedImage);
    } else if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      const signatureData = createTransparentSignature(canvas);
      onSave(signatureData);
    }
    onClose();
  };

  const handleClear = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
    setUploadedImage(null);
  };

  const createTransparentSignature = (canvas) => {
    const { width, height } = canvas;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    const imageData = canvas.getContext("2d").getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL("image/png");
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const targetRatio = 2;

      const currentRatio = originalWidth / originalHeight;
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      // ✅ 비율이 2:1이 아니면 캔버스를 새로 생성하여 여백 추가
      if (Math.abs(currentRatio - targetRatio) > 0.01) {
        if (currentRatio > targetRatio) {
          // 가로가 너무 김 → 세로를 늘려야 함
          newHeight = originalWidth / targetRatio;
        } else {
          // 세로가 너무 김 → 가로를 늘려야 함
          newWidth = originalHeight * targetRatio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");

        // ✅ 투명 배경
        ctx.clearRect(0, 0, newWidth, newHeight);

        // ✅ 이미지 중앙에 배치
        const x = (newWidth - originalWidth) / 2;
        const y = (newHeight - originalHeight) / 2;
        ctx.drawImage(img, x, y, originalWidth, originalHeight);

        const paddedDataUrl = canvas.toDataURL("image/png");
        setUploadedImage(paddedDataUrl);
      } else {
        // ✅ 비율이 이미 2:1이면 그대로 사용
        setUploadedImage(e.target.result);
      }
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
};

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={popupStyle}>
      <h3>서명 입력</h3>

      {uploadedImage ? (
        <img
          src={uploadedImage}
          alt="Uploaded signature"
          style={{ width: canvasWidth, height: canvasHeight, objectFit: "contain", border: "1px solid #000" }}
        />
      ) : (
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: canvasHeight,
            className: "signatureCanvas",
            style: {
              border: "1px solid #000",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              marginTop: "8px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            },
          }}
        />
      )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        
      <div
        style={{
          width: "100%",
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative", // 중앙 div 위치 기준
        }}
      >
        <BigButton title="취소            "onClick={onClose} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
        <BigButton marginRight={8} title="초기화" onClick={handleClear} />
        <BigButton inverted={true} title="저장" onClick={handleSave} /></div>
        <BigButton
          title="이미지 업로드"
          onClick={handleUploadClick}
        />
      </div>
    </div>
  );
};

const popupStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "20px",
  border: "1px solid #000",
  zIndex: 1000,
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  width: "90vw",
  maxWidth: "500px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};



export default SignaturePopup;
