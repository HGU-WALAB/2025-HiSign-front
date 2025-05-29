import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isLoggingOutState } from '../recoil/atom/isLoggingOutState';
import { loginMemberState } from '../recoil/atom/loginMemberState';
import ApiService from '../utils/ApiService';

const HisnetLogoutButton = () => {
  const setMember = useSetRecoilState(loginMemberState);
  const setIsLoggingOut = useSetRecoilState(isLoggingOutState);
  const navigate = useNavigate();

  const handleLogout = () => {
    //console.log("🔴 로그아웃 시작");
    setIsLoggingOut(true);
    ApiService.logout();
    //console.log("➡️ 이동 중...");
    navigate("/", { replace: true });

    localStorage.removeItem("admin_monthFilter");
    localStorage.removeItem("admin_statusFilter");
    localStorage.removeItem("admin_searchQuery");

    setTimeout(() => {
      //console.log("🧹 상태 초기화 중...");
      setMember({
        uniqueId: null,
        name: '',
        email: '',
        role: '',
        isLoading: false,
      });

      // ❗ 로그아웃 플래그는 조금 뒤에 끈다
      setTimeout(() => {
        setIsLoggingOut(false);
        //console.log("✅ 로그아웃 완료");
      }, 300);
    }, 0);
  };


  return (
    <button onClick={handleLogout} style={buttonStyle}>
      로그아웃
    </button>
  );
};

export default HisnetLogoutButton;

  // 버튼 스타일 정의
  const buttonStyle = {
    backgroundColor: '#FF5733',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    // margin: '5px',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#E64A19',
  };