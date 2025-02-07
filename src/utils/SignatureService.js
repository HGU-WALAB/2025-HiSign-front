const SignatureService = {
  /**
   * 서명 박스를 추가하는 함수
   */
  addSignatureBox: (signers, setSigners, email, pageNum) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: [
                ...signer.signatureFields,
                {
                  type: 0,
                  position: {
                    pageNumber: pageNum + 1,
                    x: 100,
                    y: 150,
                  },
                  width: 150,
                  height: 50,
                },
              ],
            }
          : signer
      )
    );
  },

  /**
   * 서명 박스의 위치를 업데이트하는 함수
   */
  updateSignaturePosition: (signers, setSigners, email, index, position) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.map((field, idx) =>
                idx === index
                  ? {
                      ...field,
                      position: { 
                        ...field.position,
                        x: position.x, 
                        y: position.y 
                      },
                    }
                  : field
              ),
            }
          : signer
      )
    );
  },

  /**
   * 서명 박스의 크기를 업데이트하는 함수
   */
  updateSignatureSize: (signers, setSigners, email, index, width, height, position) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.map((field, idx) =>
                idx === index
                  ? {
                      ...field,
                      width: width,
                      height: height,
                      position: { 
                        ...field.position, // 기존 position 값 유지
                        x: position.x, 
                        y: position.y 
                      },
                    }
                  : field
              ),
            }
          : signer
      )
    );
  },

  /**
   * 서명 박스를 삭제하는 함수
   */
  removeSignatureBox: (signers, setSigners, email, index) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.filter((_, idx) => idx !== index),
            }
          : signer
      )
    );
  },
};

export default SignatureService;
