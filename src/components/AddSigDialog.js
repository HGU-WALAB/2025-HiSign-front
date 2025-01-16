import { Dialog } from "./Dialog";
import SignatureCanvas from "react-signature-canvas";
import { ConfirmOrCancel } from "./ConfirmOrCancel";
import { primary45 } from "../utils/colors";
import { useRef, useState } from "react";

export function AddSigDialog({ onConfirm, onClose, autoDate, setAutoDate }) {
  const sigRef = useRef(null);
  // 서명 크기 조절을 위한 상태 추가
  const [signatureScale, setSignatureScale] = useState(1);

  const styles = {
    sigContainer: {
      display: "flex",
      justifyContent: "center",
    },
    sigBlock: {
      display: "inline-block",
      border: `1px solid ${primary45}`,
    },
    instructions: {
      display: "flex",
      justifyContent: "space-between",
      textAlign: "center",
      color: primary45,
      marginTop: 8,
      width: 600,
      alignSelf: "center",
    },
    instructionsContainer: {
      display: "flex",
      justifyContent: "center",
    },
    // 크기 조절 컨트롤을 위한 스타일 추가
    sizeControl: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      gap: 10,
    },
    sizeLabel: {
      color: primary45,
      fontSize: 14,
    },
    sizeValue: {
      color: primary45,
      minWidth: 40,
      textAlign: "center",
    }
  };

  // 서명 데이터 URL을 생성하고 크기를 조절하는 함수
  const createScaledSignature = () => {
    const originalSignature = sigRef.current.toDataURL();
    
    // 캔버스를 생성하여 크기가 조절된 서명 그리기
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // 원본 크기에 스케일 적용
        canvas.width = img.width * signatureScale;
        canvas.height = img.height * signatureScale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img, 
          0, 
          0, 
          img.width * signatureScale, 
          img.height * signatureScale
        );
        
        resolve(canvas.toDataURL());
      };
      img.src = originalSignature;
    });
  };

  return (
    <Dialog
      isVisible={true}
      title={"서명 추가하기"}
      body={
        <div style={styles.container}>
          <div style={styles.sigContainer}>
            <div style={styles.sigBlock}>
              <SignatureCanvas
                velocityFilterWeight={1}
                ref={sigRef}
                canvasProps={{
                  width: "800",
                  height: 300,
                  className: "sigCanvas",
                }}
              />
            </div>
          </div>
          
          {/* 크기 조절 컨트롤 추가 */}
          <div style={styles.sizeControl}>
            <span style={styles.sizeLabel}>서명 크기:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={signatureScale}
              onChange={(e) => setSignatureScale(parseFloat(e.target.value))}
            />
            <span style={styles.sizeValue}>{(signatureScale * 100).toFixed(0)}%</span>
          </div>

          <div style={styles.instructionsContainer}>
            <div style={styles.instructions}>
              <div>
                현재 날짜 / 시간 {" "}
                <input
                  type={"checkbox"}
                  checked={autoDate}
                  onChange={(e) => setAutoDate(e.target.checked)}
                />
              </div>
              <div>위에 서명을 추가하세요</div>
            </div>
          </div>

          <ConfirmOrCancel
            onCancel={onClose}
            onConfirm={async () => {
              // 크기가 조절된 서명 URL 생성
              const scaledSigURL = await createScaledSignature();
              onConfirm(scaledSigURL);
            }}
          />
        </div>
      }
    />
  );
}