import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body, #root {
    background-color: #fff !important;
  }

  * {
    font-family: 'Nanum Gothic', sans-serif;
  }
`;

export default GlobalStyle;
