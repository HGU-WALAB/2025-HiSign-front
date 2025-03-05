import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { authState } from '../recoil/atom/authState';
import { loginMemberState } from '../recoil/atom/loginMemberState';

const HisnetLogoutButton = () => {
  const setAuth = useSetRecoilState(authState);
  const setMember = useSetRecoilState(loginMemberState);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
    });
    setMember({
      unique_id: null,          // 사용자 ID
      name: '',          // 사용자 이름
      email: '',         // 사용자 이메일
      level: '',         // 사용자 권한
    });
    sessionStorage.removeItem('token'); // 로그아웃 시 토큰 삭제
    navigate('/'); // 로그아웃 후 로그인 페이지로 이동
  };

  // 버튼 스타일 정의
  const buttonStyle = {
    backgroundColor: '#FF5733',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '10px 0',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#E64A19',
  };



  
  return (
    <button
      onClick={handleLogout}
      style={buttonStyle}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
    >
      로그아웃
    </button>
  );
};

export default HisnetLogoutButton;
