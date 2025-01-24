import { atom } from "recoil";

export const signatureState = atom({
  key: "signatureState",
  default: [{
    type: null,
    signerEmail: null,
    width: null,
    height: null,
    position:{
      pageNumber: null,
      x: null,
      y: null
    }
  }]
});