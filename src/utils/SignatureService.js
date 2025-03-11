import { v4 as uuidv4 } from "uuid"; // UUID 라이브러리

const SignatureService = {
  /**
   * 서명 박스를 추가하는 함수
   */
  addSignatureBox: (setSigners, email, pageNum) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: [
                ...signer.signatureFields,
                {
                  id: uuidv4(),
                  type: 0,
                  position: {
                    pageNumber: pageNum,
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
  updateSignaturePosition: (setSigners, email, id, position) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.map((field) =>
                field.id === id
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
  updateSignatureSize: (setSigners, email, id, width, height, position) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.map((field, idx) =>
                field.id === id
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
  removeSignatureBox: (setSigners, email, id) => {
    setSigners((prevSigners) =>
      prevSigners.map((signer) =>
        signer.email === email
          ? {
              ...signer,
              signatureFields: signer.signatureFields.filter((field) => field.id !== id),
            }
          : signer
      )
    );
  },
};

export default SignatureService;