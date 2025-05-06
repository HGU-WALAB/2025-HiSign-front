// components/SignPage/SignatureOverlay.js
import React from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { signingState } from "../../recoil/atom/signingState";

const SignatureOverlay = ({ currentPage, scale }) => {
  const signing = useRecoilValue(signingState);

  return (
    <>
      {signing.signatureFields
        ?.filter((field) => field.position.pageNumber === currentPage)
        .map((field, index) => (
          <FieldBox
            key={index}
            style={{
              left: `${field.position.x * scale}px`,
              top: `${field.position.y * scale}px`,
              width: `${field.width * scale}px`,
              height: `${field.height * scale}px`,
              border: field.image ? "none" : "2px dashed black",
              backgroundColor: field.image ? "transparent" : "#f8f9fa50",
            }}
          >
            {field.image && (
              <img
                src={field.image}
                alt="서명"
                style={{ width: "100%", height: "100%", objectFit: "contain", border: "2px solid black" }}
              />
            )}
          </FieldBox>
        ))}
    </>
  );
};

const FieldBox = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

export default SignatureOverlay;
