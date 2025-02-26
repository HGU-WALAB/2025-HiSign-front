import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import MyRoutes from "./Routes";
import GlobalStyle from './styles/GlobalStyle';
import 'bootstrap/dist/css/bootstrap.min.css';

import SvgIcon from "@mui/material/SvgIcon";
import { SvgIconComponent } from "@mui/icons-material";
// styles
import"./asset/css/paper-kit.css"
// import "bootstrap/scss/bootstrap.scss";
// import "assets/scss/paper-kit.scss?v=1.3.0";
// import "assets/demo/demo.css?v=1.3.0";


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