import { Route, Routes } from "react-router-dom";
import LoginCallback from "./auth/LoginCallback";
import useRestoreLoginFromCookie from './hooks/useRestoreLoginFromCookie';
import Sidebar from "./Layout/Sidebar";
import AddSignerPage from "./Pages/AddSignerPage";
import AdminPage from './Pages/AdminListPage';
import AllocatePage from "./Pages/AllocatePage";
import CheckPassowrdPage from './Pages/CheckPasswordPage';
import CheckTaskPage from './Pages/CheckTaskPage';
import CompleteSignPage from "./Pages/CompleteSignPage";
import DashBoardPage from './Pages/DashBoardPage';
import DetailPage from "./Pages/DetailPage";
import LandingPage from "./Pages/LandingPage";
import PreviewTaskPage from './Pages/PreviewTaskPage';
import ReceivedDocuments from "./Pages/ReceiveListPage";
import RequestedDocuments from "./Pages/RequestListPage";
import SetupTaskPage from "./Pages/SetupTaskPage";
import SignPage from './Pages/SignPage';
import RequireLogin from './utils/RequireLogin';

function MyRoutes() {
    useRestoreLoginFromCookie();

    return (
        <Routes>
            {/* 사이드바 없는 페이지 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login-ing" element={<LoginCallback />} />
            <Route path="/checkEmail" element={<CheckPassowrdPage />} />
            <Route path="/preview" element={<PreviewTaskPage />} />
            <Route path="/sign" element={<SignPage />} />
            <Route path="/sign-complete" element={<CompleteSignPage />} />
            
            <Route path="/tasksetup" element={
                <RequireLogin><SetupTaskPage /></RequireLogin>
            } />
            <Route path="/request" element={
                <RequireLogin><AddSignerPage /></RequireLogin>
            } />
            <Route path="/align" element={
                <RequireLogin><AllocatePage /></RequireLogin>
            } />

            {/* 사이드바 포함된 페이지들 */}
            <Route element={<Sidebar />}>
                <Route path="/dashboard" element={
                    <RequireLogin><DashBoardPage /></RequireLogin>
                } />
                <Route path="/request-document" element={
                    <RequireLogin><RequestedDocuments /></RequireLogin>
                } />
                <Route path="/receive-document" element={
                    <RequireLogin><ReceivedDocuments /></RequireLogin>
                } />
                <Route path="/admin-document" element={
                    <RequireLogin><AdminPage /></RequireLogin>
                } />
                <Route path="/detail/:documentId" element={
                    <RequireLogin><DetailPage /></RequireLogin>
                } />
                <Route path="/check-task/:documentId" element={
                    <RequireLogin><CheckTaskPage /></RequireLogin>
                } />
            </Route>
        </Routes>
    );
}

export default MyRoutes;
