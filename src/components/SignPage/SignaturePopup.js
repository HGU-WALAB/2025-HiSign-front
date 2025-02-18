import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";
import { BigButton } from "../BigButton"; // 기존 버튼 스타일 적용

const SignaturePopup = ({ field, fieldIndex, onClose }) => {
  const [signing, setSigning] = useRecoilState(signingState);
  const sigCanvas = useRef(null);

  // 서명 저장 (캔버스에서 이미지로 변환)
  const handleSave = () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.toDataURL("image/png");

      setSigning((prevState) => ({
        ...prevState,
        signatureFields: prevState.signatureFields.map((f, idx) =>
          idx === fieldIndex ? { ...f, image: signatureData } : f
        ),
      }));
    }
    onClose();
  };

  // 서명 초기화
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  return (
    <div style={popupStyle}>
      <h3>서명 입력</h3>

      {/* 서명 캔버스 */}
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 400,
          height: 200,
          className: "signatureCanvas",
          style: signatureCanvasStyle, // 스타일 적용
        }}
      />

      {/* 버튼 그룹 */}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
        <BigButton marginRight={8} title="초기화" onClick={handleClear} />
        <BigButton marginRight={8} title="저장" onClick={handleSave} />
        <BigButton inverted={true} title="취소" onClick={onClose} />
      </div>
    </div>
  );
};

// 팝업 스타일
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
};

// 서명 캔버스 스타일
const signatureCanvasStyle = {
  border: "1px solid #000",
  borderRadius: "8px",
  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
  marginTop: "8px",
};

export default SignaturePopup;
