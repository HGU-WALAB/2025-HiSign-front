import React from 'react';
import { Route, Routes } from "react-router-dom";
import LoginCallback from "./auth/LoginCallback";
import Header from "./Layout/Header";
import AddSignerPage from "./Pages/AddSignerPage";
import AllocatePage from "./Pages/AllocatePage";
import CheckEmailPage from './Pages/CheckEmailPage';
import CompleteSignPage from "./Pages/CompleteSignPage";
import ContactPage from './Pages/ContactPage';
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
            <Route element={<Header />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login-ing" element={<LoginCallback />} />
                <Route path="/checkEmail" element={<CheckEmailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/sign-complete" element={<CompleteSignPage />} />
                <Route path="/preview" element={<PreviewTaskPage />} />

                {/* 로그인 필요한 구간 */}
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
