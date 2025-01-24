import React from 'react';
import { Route, Routes } from "react-router-dom";
import LoginCallback from "./auth/LoginCallback";
import Header from "./Layout/Header";
import AlignPage from './Pages/AlignPage';
import DetailPage from "./Pages/DetailPage";
import IntroPage from "./Pages/IntroPage";
import ListPage from "./Pages/ListPage";
import MakePage from "./Pages/MakePage";
import RequestPage from "./Pages/RequestPage";
import UploadPage from "./Pages/UploadPage";



function MyRoutes() {
    return (
        <Routes>
            <Route element={<Header />}>
                <Route path="/" index="index" element={<IntroPage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/add" element={<MakePage />} />
                <Route path="/detail/:documentId" element={<DetailPage />} />
                <Route path="/login-ing" element={<LoginCallback />} />
                <Route path="/request" element={<RequestPage />} />
                <Route path="/align" element={<AlignPage />} />
                <Route path="/request" element={<RequestPage />} />
            </Route>
        </Routes>
    );
}

export default MyRoutes;
