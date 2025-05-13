import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { loginMemberState } from '../recoil/atom/loginMemberState';
import ApiService from '../utils/ApiService';

const HisnetLogoutButton = () => {
  const setMember = useSetRecoilState(loginMemberState);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); // 로그아웃 후 로그인 페이지로 이동
    ApiService.logout(); // 로그아웃 API 호출
    setMember({
      uniqueId: null,          // 사용자 ID
      name: '',          // 사용자 이름
      email: '',         // 사용자 이메일
      level: '',         // 사용자 권한
    });
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