// src/components/Board_update.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "./api/axiosInstance";
import Header from './Header'; // ✨ Header 추가
import './Board_update.css'; // ✨ 새로 만들 CSS 파일
import { FaSave, FaTimes, FaRedo } from 'react-icons/fa'; // ✨ 아이콘 추가

const Board_update = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitStatus, setSubmitStatus] = useState({ message: null, type: null });

    // ✨ fetch 로직을 useCallback으로 감싸 안정성 확보
    const fetchQuestionDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/api/board/detail/${id}`);
            const questionData = response.data;
            setSubject(questionData.subject);
            setContent(questionData.content);
        } catch (err) {
            console.error("Error fetching board detail for update:", err);
            const status = err.response?.status;
            if (status === 403) {
                setError("이 게시글을 수정할 권한이 없습니다.");
            } else if (status === 404) {
                setError("수정하려는 게시글을 찾을 수 없습니다.");
            } else {
                setError("게시글 정보를 불러오는 데 실패했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!sessionStorage.getItem("accessToken")) {
            alert("로그인이 필요합니다.");
            navigate('/user/login');
            return;
        }
        fetchQuestionDetail();
    }, [id, navigate, fetchQuestionDetail]);
    
    // ✨ alert() 제거 및 UI 피드백 강화
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: null, type: null });

        if (!subject.trim() || !content.trim()) {
            setSubmitStatus({ message: "제목과 내용을 모두 입력해주세요.", type: 'error' });
            return;
        }

        try {
            await axiosInstance.put(`/api/question/modify/${id}`, { subject, content });
            setSubmitStatus({ message: "게시글이 성공적으로 수정되었습니다!", type: 'success' });
            setTimeout(() => {
                navigate(`/board/detail/${id}`);
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "수정 중 오류가 발생했습니다.";
            setSubmitStatus({ message: errorMessage, type: 'error' });
        }
    };
    
    // --- 렌더링 ---
    if (loading) return <div className="form-status-container"><div className="spinner"></div><p>수정할 내용을 불러오는 중입니다...</p></div>;
    if (error) return (
        <div className="form-status-container error">
            <p>{error}</p>
            <div className="status-actions">
                <button onClick={fetchQuestionDetail} className="retry-button"><FaRedo/> 다시 시도</button>
                <button onClick={() => navigate('/board')} className="list-button-alt"><FaTimes/> 게시판으로</button>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="update-page-container">
                <div className="update-form-wrapper">
                    <header className="update-form-header">
                        <h1>게시글 수정</h1>
                        <p>내용을 수정한 후 저장 버튼을 눌러주세요.</p>
                    </header>
                    <form onSubmit={handleSubmit} className="update-form">
                        <div className="form-group">
                            <label htmlFor="subject">제목</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="form-control"
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
                                rows="15" // 충분한 높이 제공
                                required
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => navigate(`/board/detail/${id}`)}>
                                취소
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

export default Board_update;