import { Link } from "react-router-dom";

function IntroPage() {
    return (
        <div>
            <Link to = "/list">리스트 페이지</Link>
            <Link to = "/add">등록 페이지</Link>
        </div>
    )
}
export default IntroPage;