// src/components/Board_create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Board_create.css"; // ✨ 새로 만들 CSS 파일
import Header from './Header'; // ✨ Header 추가
import axiosInstance from "./api/axiosInstance";
import { FaSave, FaTimes } from 'react-icons/fa'; // ✨ 아이콘 추가

const Board_create = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    // ✨ UI 피드백을 위해 상태를 객체로 관리
    const [submitStatus, setSubmitStatus] = useState({ message: null, type: null });

    // ✨ 페이지 접근 시 로그인 상태 확인
    useEffect(() => {
        if (!sessionStorage.getItem("accessToken")) {
            alert("글을 작성하려면 로그인이 필요합니다.");
            navigate('/user/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: null, type: null });

        if (!subject.trim() || !content.trim()) {
            setSubmitStatus({ message: "제목과 내용을 모두 입력해주세요.", type: 'error' });
            return;
        }

        try {
            const response = await axiosInstance.post("/api/question/create", { 
                subject, 
                content 
            });

            if (response.status === 200 || response.status === 201) {
                setSubmitStatus({ message: "글이 성공적으로 등록되었습니다! 곧 목록으로 이동합니다.", type: 'success' });
                setTimeout(() => {
                    navigate("/board");
                }, 1500);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "등록 중 오류가 발생했습니다.";
            setSubmitStatus({ message: errorMessage, type: 'error' });
            
            if (err.response?.status === 403) {
                // 권한 오류 시 로그인 페이지로 유도
                setTimeout(() => navigate('/user/login'), 2000);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="create-page-container">
                <div className="create-form-wrapper">
                    <header className="create-form-header">
                        <h1>사기 경험 등록</h1>
                        <p>소중한 경험을 공유하여 다른 사람들의 피해를 예방해주세요.</p>
                    </header>
                    <form onSubmit={handleSubmit} className="create-form">
                        <div className="form-group">
                            <label htmlFor="subject">제목</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="form-control"
                                placeholder="어떤 유형의 사기였나요? (예: 신축빌라 깡통전세)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">내용</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="form-control"
                                rows="15"
                                placeholder="겪으셨던 상황을 구체적으로 설명해주세요. 다른 사람들이 참고할 수 있도록 가능한 자세하게 작성해주시면 큰 도움이 됩니다."
                                required
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => navigate('/board')}>
                                <FaTimes /> 취소
                            </button>
                            <button type="submit" className="submit-btn">
                                <FaSave /> 저장하기
                            </button>
                        </div>

                        {submitStatus.message && (
                            <div className={`submit-status ${submitStatus.type}`}>
                                {submitStatus.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Board_create;