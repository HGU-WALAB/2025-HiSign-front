import React from 'react';
import { Route, Routes, Outlet } from "react-router-dom";
import LoginCallback from "./auth/LoginCallback";
import Sidebar from "./Layout/Sidebar";
import AddSignerPage from "./Pages/AddSignerPage";
import AllocatePage from "./Pages/AllocatePage";
import CheckEmailPage from './Pages/CheckEmailPage';
import CompleteSignPage from "./Pages/CompleteSignPage";
import DetailPage from "./Pages/DetailPage";
import LandingPage from "./Pages/LandingPage";
import PreviewTaskPage from './Pages/PreviewTaskPage';
import ReceivedDocuments from "./Pages/ReceiveListPage";
import RequestedDocuments from "./Pages/RequestListPage";
import SetupTaskPage from "./Pages/SetupTaskPage";
import SignPage from './Pages/SignPage';
import RequireLogin from './utils/RequireLogin';

function MyRoutes() {
    return (
        <Routes>
            <Route element={<Sidebar />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login-ing" element={<LoginCallback />} />
                <Route path="/checkEmail" element={<CheckEmailPage />} />
                <Route path="/preview" element={<PreviewTaskPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/sign-complete" element={<CompleteSignPage />} />
    

                {/* Login-required routes */}
                <Route path="/tasksetup" element={
                    <RequireLogin><SetupTaskPage /></RequireLogin>
                } />
                <Route path="/request" element={
                    <RequireLogin><AddSignerPage /></RequireLogin>
                } />
                <Route path="/align" element={
                    <RequireLogin><AllocatePage /></RequireLogin>
                } />
                <Route path="/request-document" element={
                    <RequireLogin><RequestedDocuments /></RequireLogin>
                } />
                <Route path="/receive-document" element={
                    <RequireLogin><ReceivedDocuments /></RequireLogin>
                } />
                <Route path="/detail/:documentId" element={
                    <RequireLogin><DetailPage /></RequireLogin>
                } />
            </Route>
        </Routes>
    );
}

export default MyRoutes;