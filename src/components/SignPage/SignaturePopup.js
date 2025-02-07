import { useState } from "react";
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";

const SignaturePopup = ({ field, fieldIndex, onClose }) => {
  const [signing, setSigning] = useRecoilState(signingState);
  const [text, setText] = useState(field.text || ""); // 기존 텍스트 유지

  // 서명 이미지 업데이트
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSigning((prevState) => ({
        ...prevState,
        image: reader.result, // ✅ 하나의 서명 이미지를 공유
      }));
    };
    reader.readAsDataURL(file);
  };

  // 서명 텍스트 업데이트
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // 서명 저장
  const handleSave = () => {
    setSigning((prevState) => ({
      ...prevState,
      signatureFields: prevState.signatureFields.map((f, idx) =>
        idx === fieldIndex ? { ...f, text: text } : f
      ),
    }));
    onClose();
  };

  return (
    <div style={popupStyle}>
      <h3>서명 입력</h3>

      {field.type === 0 && (
        <div>
          <p>서명 이미지 업로드:</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}

      {field.type === 1 && (
        <div>
          <p>텍스트 서명 입력:</p>
          <input type="text" value={text} onChange={handleTextChange} />
        </div>
      )}

      <button onClick={handleSave}>저장</button>
      <button onClick={onClose}>취소</button>
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
  border: "1px solid black",
  zIndex: 1000,
};

export default SignaturePopup;
