import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap');

  * {
    font-family: 'Nanum Gothic', sans-serif;
  }
`;

export default GlobalStyle;