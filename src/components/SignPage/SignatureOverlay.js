import { Rnd } from "react-rnd";

function SignatureOverlay({ signatureFields }) {
  return (
    <>
      {signatureFields.map((field, index) => (
        <Rnd
          key={index}
          size={{ width: field.width, height: field.height }}
          position={{ x: field.x, y: field.y }}
          bounds="parent"
          disableDragging
        >
          <div style={{
            border: "2px dashed red",
            background: "rgba(255,0,0,0.2)",
            textAlign: "center",
            lineHeight: `${field.height}px`
          }}>
            서명
          </div>
        </Rnd>
      ))}
    </>
  );
}

export default SignatureOverlay;
