import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import MyRoutes from "./Routes";
import GlobalStyle from './styles/GlobalStyle';
// styles
import "./asset/css/paper-kit.css";
// import "bootstrap/scss/bootstrap.scss";
// import "assets/scss/paper-kit.scss?v=1.3.0";
// import "assets/demo/demo.css?v=1.3.0";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/hisign">
          <RecoilRoot>
            <MyRoutes />
          </RecoilRoot>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;