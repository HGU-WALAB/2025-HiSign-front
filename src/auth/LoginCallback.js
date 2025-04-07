// LoginCallback.js
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { loginMemberState } from '../recoil/atom/loginMemberState';
import ApiService from '../utils/ApiService';

const LoginCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setloginMemberState = useSetRecoilState(loginMemberState);

  // URL에서 토큰 추출
  const getTokenFromUrl = (search) => {
    const params = new URLSearchParams(search);
    return params.get('token'); //?token=eyJhbGci... -> 토큰 반환
  };

  const handleToken = async () => {
    const token = getTokenFromUrl(location.search);

    if (token) {
      try {
        const response = await ApiService.login(token);
        
        // 토큰 정보 디코딩
        console.log("로그인 성공:", response);
        // 토큰 정보 디코
        const payload = jwtDecode(response.data.token);
        console.log("디코딩된 페이로드:", payload);
        // 사용자 정보 상태 변경
        setloginMemberState({
          unique_id: payload.sub,
          name: payload.name,
          email: payload.email,
          level: payload.role,
        });
        
        // 페이지 이동
        navigate('/');
      } catch (error) {
        console.error("토큰 넘기는 과정에서 오류 발생:", error);
      }
    } else {
      console.error('토큰이 존재하지 않습니다.');
    }
  };

  useEffect(() => {
    handleToken();
  }, []);
};

export default LoginCallback;