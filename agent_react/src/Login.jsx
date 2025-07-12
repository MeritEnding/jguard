import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import './Login.css';
import Header from './Header';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/user/login', {
        username,
        password,
      });

      // ✅ 수정: axios는 헤더를 일반 객체로 다룹니다.
      const accessToken = response.headers['access']; 
      
      if (accessToken) {
        // ✅ 수정: localStorage 대신 sessionStorage를 사용하셨으므로 일관성 유지
        sessionStorage.setItem('accessToken', accessToken); 
        alert('로그인 성공!');
        navigate('/board');
      } else {
        alert('로그인 실패: 토큰을 받지 못했습니다. 다시 시도해주세요.');
        console.error('로그인 응답에 Access Token이 없습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      if (error.response) {
        alert(`로그인 실패: ${error.response.data.message || '아이디 또는 비밀번호가 일치하지 않습니다.'}`);
      } else if (error.request) {
        alert('로그인 실패: 서버에 연결할 수 없습니다.');
      } else {
        alert('로그인 실패: 요청 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="login-container">
      <Header/>
      <div className='login-body'>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">아이디:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">로그인</button>
          <button type="button" onClick={() => navigate('/signup')} className="signup-button">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;