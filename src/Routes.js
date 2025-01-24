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
// import FileUpload from "./components/signRequest/FileUpload";
// import AddSigner from "./components/signRequest/AddSigner";
// import AlignSign from "./components/signRequest/AlignSign";



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
                {/*<Route path="/add-file" element={<FileUpload />} />*/}
                {/*<Route path="/add-signers" element={<AddSigner />} />*/}
                {/*<Route path="/align-sign" element={<AlignSign />} />*/}
            </Route>
        </Routes>
    );
}

export default MyRoutes;
