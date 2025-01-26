import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import LoginCallback from "./auth/LoginCallback";
import Header from "./Layout/Header";
import AlignPage from "./Pages/AlignPage";
import DetailPage from "./Pages/DetailPage";
import IntroPage from "./Pages/IntroPage";
import ListPage from "./Pages/ListPage";
import RequestPage from "./Pages/RequestPage";
import UploadPage from "./Pages/UploadPage";

function App() {
  return (
    <BrowserRouter>
      <RecoilRoot>
        <Routes>
              <Route element={<Header />}>
                  <Route path="/" index="index" element={<IntroPage />} />
                  <Route path="/list" element={<ListPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/detail/:documentId" element={<DetailPage />} />
                  <Route path="/login-ing" element={<LoginCallback />} />
                  <Route path="/request" element={<RequestPage />} />
                  <Route path="/align" element={<AlignPage />} />
              </Route>
          </Routes>
      </RecoilRoot>
    </BrowserRouter>
  );
}

export default App;
