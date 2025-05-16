// SignatureMarker.js
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";

const SignatureMarker = ({ signers,currentPage,scale }) => {
  const [signing] = useRecoilState(signingState);
  if (!Array.isArray(signing.signatureFields)) {
    return null;  // ✅ 필드가 배열이 아니면 아무것도 렌더링하지 않음
  }
  return (
    <>
      {signers.flatMap((signer, index) =>
        signer.signatureFields
          .filter((field) => field.position.pageNumber === currentPage)
          .map((field, idx) => (
            <div
              key={`${signer.email}-${idx}`}
              style={{
                position: "absolute",
                left: field.position.x * scale,
                top: field.position.y * scale,
                width: field.width * scale,
                height: field.height * scale,
                border: `2px dashed ${signer.color}`,
                backgroundColor: `${signer.color}20`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {signer.name}
            </div>
          ))
      )}
    </>
  );
};

export default SignatureMarker;
