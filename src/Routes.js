import { Route, Routes } from "react-router-dom";
import IntroPage from "./Pages/IntroPage"
import ListPage from "./Pages/ListPage"
import MakePage from "./Pages/MakePage"
import Header from "./Layout/Header";
import SideBar from "./Layout/SideBar";

function MyRoutes () {
    return (
        <Routes>
            <Route element = {<Header/>}>
                <Route element = {<SideBar/>}>
                    <Route path="/" index="index" element={<IntroPage />}/>
                    <Route path="/list" element={<ListPage />}/>
                    <Route path="/add" element={<MakePage />}/>
                </Route>
            </Route>
        </Routes>
    )
}



export default MyRoutes;