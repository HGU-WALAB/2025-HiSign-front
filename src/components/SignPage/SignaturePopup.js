// SignaturePopup.js
import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";
import { BigButton } from "../BigButton";

const SignaturePopup = ({ field, fieldIndex, onClose }) => {
  const [signing, setSigning] = useRecoilState(signingState);
  const sigCanvas = useRef(null);

  // 서명 저장 (캔버스에서 이미지로 변환, 배경을 투명하게 처리)
  const handleSave = () => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      const signatureData = createTransparentSignature(canvas);

      setSigning((prevState) => ({
        ...prevState,
        signatureFields: prevState.signatureFields.map((f, idx) =>
          idx === fieldIndex ? { ...f, image: signatureData } : f
        ),
      }));
    }
    onClose();
  };

  // 서명의 배경을 투명하게 만드는 함수
  const createTransparentSignature = (canvas) => {
    // 원본 캔버스의 크기를 가져옴
    const { width, height } = canvas;
    
    // 새 캔버스 생성
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    // 원본 캔버스의 이미지 데이터 가져오기
    const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 배경 색상을 투명하게 설정
    for (let i = 0; i < data.length; i += 4) {
      // 하얀색 배경인 경우 (R,G,B 모두 255 또는 매우 높은 값)
      if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
        // 완전히 투명하게 설정
        data[i+3] = 0;
      }
    }
    
    // 수정된 이미지 데이터를 새 캔버스에 그리기
    ctx.putImageData(imageData, 0, 0);
    
    // 투명 배경으로 된 PNG 이미지로 변환
    return tempCanvas.toDataURL('image/png');
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
          style: signatureCanvasStyle,
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
