// SignupForm.jsx
import React, { useState } from 'react';
import { signup } from '../api/userApi';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password1: '',
    password2: '',
    email: '',
  });

  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

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
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">회원가입</h2>

      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((err, idx) => (
            <p key={idx} className="error-message">{err}</p>
          ))}
        </div>
      )}

      {successMessage && <div className="success-box">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="signup-form">
        <label htmlFor="username">사용자ID</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="password1">비밀번호</label>
        <input
          type="password"
          id="password1"
          name="password1"
          value={formData.password1}
          onChange={handleChange}
          required
        />

        <label htmlFor="password2">비밀번호 확인</label>
        <input
          type="password"
          id="password2"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default SignupForm;
