import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signup } from '../api/userApi';
import './Login.css';
import { FaShieldAlt, FaChartLine, FaComments } from 'react-icons/fa';
import logoMark from '../assets/brand/logo_mark.png';
import mascotProtect from '../assets/mascot/protect.png';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password1: '',
    password2: '',
    email: '',
  });

  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    if (formData.password1 !== formData.password2) {
      setErrors(['비밀번호가 서로 일치하지 않습니다.']);
      return;
    }

    setSubmitting(true);
    try {
      const response = await signup(formData);
      setSuccessMessage(response.data);
      setFormData({
        username: '',
        password1: '',
        password2: '',
        email: '',
      });
    } catch (error) {
      const message = error.response?.data?.message || '서버 오류가 발생했습니다.';
      setErrors([message]);
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
          <h1>가입하고 내 보증금을<br />안전하게 지키세요</h1>
          <p>회원가입은 무료이며, 1분이면 충분합니다.</p>
          <ul className="auth-feature-list">
            <li><FaShieldAlt /> AI 계약 위험 진단 무제한 이용</li>
            <li><FaChartLine /> 우리 동네 사기 이력 조회</li>
            <li><FaComments /> 사기 매물 공유 커뮤니티 참여</li>
          </ul>
          <img src={mascotProtect} alt="" className="auth-mascot" />
        </aside>

        <div className="auth-card">
          <h2>회원가입</h2>
          <p className="auth-card-sub">몇 가지 정보만 입력하면 바로 시작할 수 있어요.</p>

          {errors.length > 0 && (
            <div className="auth-error">
              {errors.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </div>
          )}

          {successMessage && (
            <div className="auth-success">
              {successMessage} <Link to="/user/login">로그인하러 가기</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">사용자 ID</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                placeholder="사용할 아이디를 입력하세요"
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password1">비밀번호</label>
              <input
                type="password"
                id="password1"
                name="password1"
                value={formData.password1}
                placeholder="비밀번호를 입력하세요"
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password2">비밀번호 확인</label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                placeholder="비밀번호를 한 번 더 입력하세요"
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                placeholder="example@jguard.kr"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? '가입 처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="auth-switch">
            이미 계정이 있나요? <Link to="/user/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
