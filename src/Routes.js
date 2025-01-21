import React from 'react';
import { Route, Routes } from "react-router-dom";
import IntroPage from "./Pages/IntroPage";
import ListPage from "./Pages/ListPage";
import MakePage from "./Pages/MakePage";
import Header from "./Layout/Header";
import DetailPage from "./Pages/DetailPage";
import SideBar from "./Layout/SideBar";

function MyRoutes() {
    return (
        <Routes>
            <Route element={<Header />}>
                <Route path="/" index="index" element={<IntroPage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/add" element={<MakePage />} />
                <Route path="/detail/:documentId" element={<DetailPage />} />
            </Route>
        </Routes>
    );
}

export default MyRoutes;
