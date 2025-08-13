import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { BigButton } from "../BigButton";
import ApiService from "../../utils/ApiService";

const SignaturePopup = ({ field, fieldIndex, onClose, onSave, applyToAll = false }) => {
    const sigCanvas = useRef(null);
    const fileInputRef = useRef(null);

    const [uploadedImage, setUploadedImage] = useState(null);
    const [saveConsent, setSaveConsent] = useState(null);

    // 커스텀 확인 모달
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);

    const popupMaxWidth = 500;
    const popupPadding = 40;
    const rawAvailableWidth = Math.min(window.innerWidth * 0.9, popupMaxWidth);
    const canvasWidth = rawAvailableWidth - popupPadding;
    const canvasHeight = canvasWidth / 2;

    const getFinalImage = () => {
        if (uploadedImage) return uploadedImage;
        if (sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            return createTransparentSignature(canvas);
        }
        return null;
    };

    const handleSave = async () => {
        if (saveConsent === null) {
            alert("서명을 저장할지 선택해주세요.");
            return;
        }

        // 저장 동의된 기존 서명 존재 여부 (백엔드: save_consent=TRUE + status=1 + imageName)
        let exists = false;
        try {
            exists = await ApiService.checkExistingSignature(field.signerEmail);
        } catch (e) {
            console.error("기존 서명 확인 실패:", e);
        }

        if (exists) {
            // OK/취소 대신: 확인(새 서명) / 기존 서명 불러오기
            setShowOverwriteModal(true);
            return;
        }

        // 기존 서명 없음 → 바로 새 서명 저장
        const finalImage = getFinalImage();
        onSave(finalImage, saveConsent);
        onClose();
    };

    // 모달: "확인" (새 서명 저장)
    const handleOverwriteWithNew = () => {
        const finalImage = getFinalImage();
        onSave(finalImage, saveConsent);
        setShowOverwriteModal(false);
        onClose();
    };

    // 모달: "기존 서명 불러오기" (save_consent=1인 최신 서명 적용)
    const handleLoadExistingAndApply = async () => {
        try {
            // 안전하게 한 번 더 확인 (없다면 진행 불가)
            const ok = await ApiService.checkExistingSignature(field.signerEmail);
            if (!ok) {
                alert("저장 동의된 이전 서명이 없어 불러올 수 없습니다.");
                setShowOverwriteModal(false);
                return;
            }

            const imageUrl = await ApiService.getLatestImageSignature(field.signerEmail);

            // 기존 서명 이미지를 바로 적용 + 동의는 true로 저장
            onSave(imageUrl, true);
            setShowOverwriteModal(false);
            onClose();
        } catch (error) {
            console.error("기존 서명 불러오기 실패:", error);
            alert("기존 서명을 불러오는 데 실패했습니다.");
            setShowOverwriteModal(false);
        }
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
        reader.onload = (ev) => {
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
                    setUploadedImage(ev.target.result);
                }
            };

            img.src = ev.target.result;
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

            {showOverwriteModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>저장된 서명이 있습니다</div>
                        <div style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
                            기존 서명을 불러오시겠습니까, 아니면 새 서명으로 저장하시겠습니까?
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <BigButton title="기존 서명 불러오기" onClick={handleLoadExistingAndApply} />
                            <BigButton inverted title="확인(새 서명 저장)" onClick={handleOverwriteWithNew} />
                        </div>
                        <div style={{ marginTop: 10, textAlign: "center" }}>
                            <button
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#888",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                                onClick={() => setShowOverwriteModal(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

/* 커스텀 모달 스타일 */
const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
};

const modalStyle = {
    background: "white",
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
    maxWidth: 420,
    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
};
