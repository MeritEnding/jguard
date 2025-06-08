import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import axiosInstance from './api/axiosInstance'; // axiosInstance는 이미 설정되어 있어야 함

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/user/login', formData);

      // Access Token은 응답 헤더에서 가져옵니다.
      const accessToken = response.headers.get('access'); 
      
      if (accessToken) {
        // 보안을 위해 Access Token을 sessionStorage에 저장
        sessionStorage.setItem('accessToken', accessToken); 
        
        setSuccessMessage('로그인 성공! 🎉 잠시 후 메인 페이지로 이동합니다.'); 
        
        setTimeout(() => {
          navigate('/'); 
        }, 1500); 
      } else {
        setError('로그인에 성공했지만 토큰을 받을 수 없습니다. 다시 시도해주세요.');
      }

    } catch (err) {
      console.error("로그인 실패:", err);
      if (err.response) {
        setError(err.response.data.message || '로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
      } else if (err.request) {
        setError('네트워크 오류: 서버에 연결할 수 없습니다. 다시 시도해주세요.');
      } else {
        setError('로그인 중 오류 발생: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">로그인</h2>

      {error && <div className="error-box">{error}</div>}
      {successMessage && <div className="success-box">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="username">사용자ID</label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="login-links">
        <Link to="/find-password">비밀번호 찾기</Link>
        <span className="divider">|</span>
        <Link to="/find-id">아이디 찾기</Link>
        <span className="divider">|</span>
        <Link to="/user/signup">회원가입</Link>
      </div>
    </div>
  );
};

export default Login;