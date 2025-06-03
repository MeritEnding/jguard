import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const LoginForm = () => {
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
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json(); // 백엔드에서 { "token": "..." } 반환해야 함
        localStorage.setItem('token', data.token); // ✅ JWT 저장
        setSuccessMessage('로그인 성공! 🎉');

        // 홈 또는 원하는 경로로 리디렉션
        navigate('/');
      } else {
        const result = await response.text();
        setError(result || '로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
      }
    } catch (err) {
      setError('서버 오류: ' + err.message);
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

export default LoginForm;
