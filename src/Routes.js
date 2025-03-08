import React from 'react';
import { Route, Routes } from "react-router-dom";
import LoginCallback from "./auth/LoginCallback";
import Header from "./Layout/Header";
import AddSignerPage from "./Pages/AddSignerPage";
import AllocatePage from "./Pages/AllocatePage";
import CompleteSignPage from "./Pages/CompleteSignPage";
import ContactPage from './Pages/ContactPage';
import DetailPage from "./Pages/DetailPage";
import LandingPage from "./Pages/LandingPage";
import ReceivedDocuments from "./Pages/ReceiveListPage";
import RequestedDocuments from "./Pages/RequestListPage";
import SetupTaskPage from "./Pages/SetupTaskPage";
import SignPage from './Pages/SignPage';

function MyRoutes() {
    return (
        <Routes>
            <Route element={<Header />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/tasksetup" element={<SetupTaskPage />} />
                <Route path="/detail/:documentId" element={<DetailPage />} />
                <Route path="/login-ing" element={<LoginCallback />} />
                <Route path="/request" element={<AddSignerPage />} />
                <Route path="/align" element={<AllocatePage />} />
                <Route path="/request-document" element={<RequestedDocuments />} />
                <Route path="/receive-document" element={<ReceivedDocuments />} />
                <Route path="/checkEmail" element={<SignPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/sign-complete" element={<CompleteSignPage/>} />
                <Route path="/contact" element={<ContactPage />} />
            </Route>
            
        </Routes>
    );
}

export default MyRoutes;
