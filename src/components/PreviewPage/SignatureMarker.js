// SignatureMarker.js
import { useRecoilState } from "recoil";
import { signingState } from "../../recoil/atom/signingState";

const SignatureMarker = ({ currentPage }) => {
  const [signing] = useRecoilState(signingState);

  return (
    <div>
      {signing.signatureFields
        .filter((field) => field.position.pageNumber === currentPage) // ✅ 현재 페이지의 서명 필드만 표시
        .map((field, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: field.position.x,
              top: field.position.y,
              width: field.width,
              height: field.height,
              border: "2px dashed rgba(236, 36, 36, 0.8)", // ✅ 부드러운 점선 테두리
              borderRadius: "8px", // ✅ 둥근 모서리 적용
              backgroundColor: "rgba(201, 106, 106, 0.3)", // ✅ 투명한 회색 배경
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        ))}
    </div>
  );
};

export default SignatureMarker;
