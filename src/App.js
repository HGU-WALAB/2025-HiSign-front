import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import MyRoutes from "./Routes";
import GlobalStyle from './styles/GlobalStyle';

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <RecoilRoot>
          <MyRoutes />
        </RecoilRoot>
      </BrowserRouter>
    </>
  );
}

export default App;