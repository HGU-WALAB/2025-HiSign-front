import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { BigButton } from "../BigButton";

const SignaturePopup = ({ field, fieldIndex, onClose, onSave, applyToAll = false }) => {
  const sigCanvas = useRef(null);

  const handleSave = () => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      const signatureData = createTransparentSignature(canvas);
      if (onSave) onSave(signatureData);
      onClose();
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
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

  return (
    <div style={popupStyle}>
      <h3>서명 입력</h3>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: window.innerWidth < 480 ? 300 : 400,
          height: 200,
          className: "signatureCanvas",
          style: signatureCanvasStyle,
        }}
      />

      <div style={{ marginTop: 10, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
        <BigButton marginRight={8} title="초기화" onClick={handleClear} />
        <BigButton marginRight={8} title="저장" onClick={handleSave} />
        <BigButton inverted={true} title="취소" onClick={onClose} />
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
  width: "90%",
  maxWidth: "500px",
  boxSizing: "border-box",
};

const signatureCanvasStyle = {
  border: "1px solid #000",
  borderRadius: "8px",
  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
  marginTop: "8px",
  width: "100%",
  height: "auto",
};

export default SignaturePopup;
