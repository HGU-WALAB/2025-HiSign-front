import React from 'react';
import { Route, Routes } from "react-router-dom";
import Header from "./Layout/Header";
import DetailPage from "./Pages/DetailPage";
import IntroPage from "./Pages/IntroPage";
import ListPage from "./Pages/ListPage";
import MakePage from "./Pages/MakePage";
import UploadPage from "./Pages/UploadPage";
import LoginCallback from "./auth/LoginCallback";

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
            </Route>
        </Routes>
    );
}

export default MyRoutes;
