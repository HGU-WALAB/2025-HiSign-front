import { useState } from "react";
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";
import SignaturePopup from "./SignaturePopup";

const SignatureOverlay = () => {
  const [signing, setSigning] = useRecoilState(signingState);
  const [selectedField, setSelectedField] = useState(null); // 선택한 서명 필드

  // 서명 입력 팝업 열기
  const openPopup = (fieldIndex) => {
    setSelectedField(fieldIndex);
  };

  // 서명 입력 팝업 닫기
  const closePopup = () => {
    setSelectedField(null);
  };

  return (
    <div style={{ position: "relative" }}>
      {signing.signatureFields.map((field, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: field.position.x,
            top: field.position.y,
            width: field.width,
            height: field.height,
            border: "2px dashed black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
          onClick={() => openPopup(index)}
        >
          {/* 서명 이미지 표시 */}
          {field.type === 0 && signing.image && (
            <img src={signing.image} alt="서명" style={{ width: "100%", height: "100%" }} />
          )}

          {/* 텍스트 서명 표시 */}
          {field.type === 1 && field.text && (
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{field.text}</span>
          )}
        </div>
      ))}

      {/* 서명 입력 팝업 */}
      {selectedField !== null && (
        <SignaturePopup
          field={signing.signatureFields[selectedField]}
          fieldIndex={selectedField}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default SignatureOverlay;
