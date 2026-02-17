import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/userApi';
import './Login.css';
import { FaShieldAlt, FaChartLine, FaComments } from 'react-icons/fa';
import logoMark from '../assets/brand/logo_mark.png';
import mascotHello from '../assets/mascot/hello.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const response = await login(username, password);
      const accessToken = response.headers['access'];

      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
        navigate('/board');
      } else {
        setErrorMessage('로그인 실패: 토큰을 받지 못했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      } else if (error.request) {
        setErrorMessage('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage('요청 중 오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <div className="auth-brand-head">
            <img src={logoMark} alt="JGuard 로고" className="auth-logo" />
            <span className="auth-brand-name">JGuard</span>
          </div>
          <h1>전세사기 걱정 없는<br />안전한 계약의 시작</h1>
          <p>제이가드와 함께 계약 전 위험을 미리 확인하세요.</p>
          <ul className="auth-feature-list">
            <li><FaShieldAlt /> AI가 진단하는 내 계약 위험도</li>
            <li><FaChartLine /> 전국 위험지도·전세가율 분석</li>
            <li><FaComments /> 피해 사례 공유 커뮤니티</li>
          </ul>
          <img src={mascotHello} alt="" className="auth-mascot" />
        </aside>

        <div className="auth-card">
          <h2>로그인</h2>
          <p className="auth-card-sub">JGuard 계정으로 모든 서비스를 이용하세요.</p>

          {errorMessage && <div className="auth-error">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                value={username}
                placeholder="아이디를 입력하세요"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                placeholder="비밀번호를 입력하세요"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="auth-switch">
            아직 계정이 없나요? <Link to="/signup">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
