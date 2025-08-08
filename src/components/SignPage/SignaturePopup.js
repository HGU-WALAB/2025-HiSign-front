import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { BigButton } from "../BigButton";
import ApiService from "../../utils/ApiService";

const SignaturePopup = ({ field, fieldIndex, onClose, onSave, applyToAll = false }) => {
    const sigCanvas = useRef(null);
    const fileInputRef = useRef(null);
    const [uploadedImage, setUploadedImage] = useState(null);

    const [saveConsent, setSaveConsent] = useState(null);

    const popupMaxWidth = 500;
    const popupPadding = 40;
    const rawAvailableWidth = Math.min(window.innerWidth * 0.9, popupMaxWidth);
    const canvasWidth = rawAvailableWidth - popupPadding;
    const canvasHeight = canvasWidth / 2;

    const handleSave = async () => {
        if (saveConsent === null) {
            alert("서명을 저장할지 선택해주세요.");
            return;
        }

        try {
            const exists = await ApiService.checkExistingSignature(field.signerEmail);
            if (exists) {
                const overwrite = window.confirm("이미 저장된 서명이 있습니다. 새로운 서명으로 하시겠습니까?");
                if (!overwrite) {
                    return;
                }
            }
        } catch (error) {
            console.error("기존 서명 확인 실패:", error);
            alert("기존 서명 여부 확인에 실패했습니다. 계속 진행합니다.");
        }

        let finalImage = null;
        if (uploadedImage) {
            finalImage = uploadedImage;
        } else if (sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            finalImage = createTransparentSignature(canvas);
        }

        onSave(finalImage, saveConsent);
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

                if (Math.abs(currentRatio - targetRatio) > 0.01) {
                    if (currentRatio > targetRatio) {
                        newHeight = originalWidth / targetRatio;
                    } else {
                        newWidth = originalHeight * targetRatio;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext("2d");

                    ctx.clearRect(0, 0, newWidth, newHeight);

                    const x = (newWidth - originalWidth) / 2;
                    const y = (newHeight - originalHeight) / 2;
                    ctx.drawImage(img, x, y, originalWidth, originalHeight);

                    const paddedDataUrl = canvas.toDataURL("image/png");
                    setUploadedImage(paddedDataUrl);
                } else {
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
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        objectFit: "contain",
                        border: "1px solid #000",
                    }}
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

            <div style={radioContainerStyle}>
                <span>서명을 저장하시겠습니까?</span>
                <label style={radioLabelStyle}>
                    <input
                        type="radio"
                        name="saveConsent"
                        value="yes"
                        checked={saveConsent === true}
                        onChange={() => setSaveConsent(true)}
                    />
                    예
                </label>
                <label style={radioLabelStyle}>
                    <input
                        type="radio"
                        name="saveConsent"
                        value="no"
                        checked={saveConsent === false}
                        onChange={() => setSaveConsent(false)}
                    />
                    아니오
                </label>
            </div>

            <div style={buttonRowStyle}>
                <BigButton title="취소" onClick={onClose} />
                <div style={centerButtonGroupStyle}>
                    <BigButton marginRight={8} title="초기화" onClick={handleClear} />
                    <BigButton
                        inverted={true}
                        title="저장"
                        onClick={handleSave}
                        disabled={saveConsent === null}
                        style={
                            saveConsent === null
                                ? {
                                    backgroundColor: "transparent",
                                    color: "#aaa",
                                    border: "1px solid #ddd",
                                    cursor: "not-allowed",
                                }
                                : {}
                        }
                    />
                </div>
                <BigButton title="이미지 업로드" onClick={handleUploadClick} />
            </div>
        </div>
    );
};

export default SignaturePopup;

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

const radioContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "12px",
    marginBottom: "12px",
};

const radioLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
};

const buttonRowStyle = {
    width: "100%",
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
};

const centerButtonGroupStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
};
