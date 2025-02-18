import { useState } from "react";
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";
import SignaturePopup from "./SignaturePopup";
import DraggableSignature from "../DraggableSignature"; // 드래그 가능한 서명 컴포넌트

const SignatureOverlay = () => {
  const [signing, setSigning] = useRecoilState(signingState);
  const [selectedField, setSelectedField] = useState(null);
  const [signatureURL, setSignatureURL] = useState(null); // 추가된 서명 이미지

  // 서명 입력 팝업 열기
  const openPopup = (fieldIndex) => {
    setSelectedField(fieldIndex);
  };

  // 서명 입력 팝업 닫기
  const closePopup = () => {
    setSelectedField(null);
  };

  // 서명을 저장하고 Recoil 상태 업데이트
  const handleSignatureConfirm = (url, position) => {
    setSignatureURL(url);
    setSigning((prev) => ({
      ...prev,
      signatureFields: [
        ...prev.signatureFields,
        { type: 0, position, width: 100, height: 50, image: url },
      ],
    }));
  };

  return (
    <div>
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
          {field.type === 0 && field.image && (
            <img src={field.image} alt="서명" style={{ width: "100%", height: "100%" }} />
          )}
          {field.type === 1 && field.text && (
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{field.text}</span>
          )}
        </div>
      ))}

      {/* 드래그 가능한 서명 */}
      {signatureURL && (
        <DraggableSignature
          url={signatureURL}
          onCancel={() => setSignatureURL(null)}
          onSet={(position) => handleSignatureConfirm(signatureURL, position)}
        />
      )}

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
