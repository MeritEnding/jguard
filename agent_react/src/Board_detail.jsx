import React, { useState, useEffect, useCallback } from "react"; // ✨ useCallback 임포트 추가
import { useParams, useNavigate } from "react-router-dom";
import "./Board_detail.css";
import Header from './Header';
import axiosInstance from "./api/axiosInstance";
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaCalendarAlt, FaEdit, FaTrash, FaList, FaPaperPlane, FaRedo } from 'react-icons/fa'; // ✨ 아이콘 추가

const Board_detail = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answerContent, setAnswerContent] = useState("");
    const [submitStatus, setSubmitStatus] = useState({ message: null, type: null });
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const getCurrentUserFromToken = () => {
        // ... (이 함수는 변경 없음)
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken) {
            try {
                const decodedToken = jwtDecode(accessToken);
                if (decodedToken.exp < Date.now() / 1000) return null;
                return { username: decodedToken.username };
            } catch (error) {
                console.error("토큰 디코딩 오류:", error);
                return null;
            }
        }
        return null;
    };
    
    // ✨ FIX: useCallback으로 함수를 감싸서 참조 안정성 확보
    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/api/board/detail/${id}`);
            setQuestion(response.data);
        } catch (err) {
            console.error("Error fetching board detail:", err);
            if (err.response) {
                if (err.response.status === 404) {
                    setError("질문을 찾을 수 없습니다. 삭제되었거나 존재하지 않는 게시물입니다.");
                } else {
                    setError(err.response.data.message || "상세 정보를 불러오는 데 실패했습니다.");
                }
            } else {
                setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setCurrentUser(getCurrentUserFromToken());
        fetchDetail();
    }, [id, fetchDetail]); // ✨ fetchDetail을 의존성 배열에 추가

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: null, type: null });
        if (!currentUser) {
            setSubmitStatus({ message: "댓글을 등록하려면 로그인이 필요합니다.", type: "error" });
            return;
        }
        if (!answerContent.trim()) {
            setSubmitStatus({ message: "내용을 입력해주세요.", type: "error" });
            return;
        }
        try {
            await axiosInstance.post(`/api/answer/create/${id}`, { content: answerContent });
            setSubmitStatus({ message: "댓글이 성공적으로 등록되었습니다!", type: "success" });
            setAnswerContent("");
            fetchDetail();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "댓글 등록 중 오류가 발생했습니다.";
            setSubmitStatus({ message: errorMessage, type: "error" });
        }
    };

    // ✨ FIX: 누락되었던 handleModify 함수 추가
    const handleModify = () => {
        if (question && question.id) {
            navigate(`/question/modify/${question.id}`);
        } else {
            setError("수정할 질문 정보를 찾을 수 없습니다.");
        }
    };

    // ✨ FIX: 누락되었던 handleDelete 함수 추가 (alert 대신 setError 사용)
    const handleDelete = async () => {
        if (!currentUser) {
            setError("게시글을 삭제하려면 로그인해야 합니다.");
            return;
        }
        if (!window.confirm("정말로 이 질문을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

        try {
            await axiosInstance.delete(`/api/question/delete/${id}`);
            alert("질문이 성공적으로 삭제되었습니다."); // 삭제 성공은 명확한 알림이 좋을 수 있음
            navigate("/board");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "질문 삭제 중 오류가 발생했습니다.";
            setError(errorMessage);
        }
    };
    
    const handleGoToList = () => navigate("/board");

    // --- 렌더링 부분 ---
    if (loading) return <div className="detail-status-container"><div className="spinner"></div><p>게시글을 불러오는 중...</p></div>;
    
    // ✨ onClick에서 fetchDetail을 바로 호출할 수 있도록 수정
    if (error) return (
        <div className="detail-status-container error">
            <p>{error}</p>
            <div className="status-actions">
                <button onClick={fetchDetail} className="retry-button"><FaRedo/> 다시 시도</button>
                <button onClick={handleGoToList} className="list-button-alt"><FaList/> 목록으로</button>
            </div>
        </div>
    );
    
    if (!question) return <div className="detail-status-container"><p>존재하지 않는 게시물입니다.</p></div>;

    const showActionButtons = currentUser && question.author && currentUser.username === question.author.username;

    return (
        <>
            <Header />
            <div className="detail-page-wrapper">
                <div className="detail-container">
                    <header className="question-header">
                        <h1 className="question-subject">{question.subject}</h1>
                        <div className="meta-and-actions">
                            <div className="question-meta-group">
                                <span className="question-meta"><FaUser className="meta-icon" /><strong>{question.author?.username || "알 수 없음"}</strong></span>
                                <span className="question-meta"><FaCalendarAlt className="meta-icon" />{new Date(question.createDate).toLocaleDateString()}</span>
                            </div>
                            {showActionButtons && (
                                <div className="question-action-buttons">
                                    <button onClick={handleModify} className="action-btn modify"><FaEdit /> 수정</button>
                                    <button onClick={handleDelete} className="action-btn delete"><FaTrash /> 삭제</button>
                                </div>
                            )}
                        </div>
                    </header>
    
                    <section className="question-body">
                        <div className="question-content">{question.content}</div>
                    </section>
    
                    <section className="answers-section">
                        <h2 className="answers-heading">{question.answerList?.length || 0}개의 댓글</h2>
                        <div className="answer-list">
                            {question.answerList?.length > 0 ? (
                                question.answerList.map((answer) => (
                                    <div key={answer.id} className="answer-item">
                                        <div className="answer-header">
                                            <span className="answer-author"><FaUser /> {answer.author?.username || ""}</span>
                                            <span className="answer-date">{new Date(answer.createDate).toLocaleString()}</span>
                                        </div>
                                        <p className="answer-content">{answer.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-answers"><p>아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p></div>
                            )}
                        </div>
                    </section>
    
                    <section className="answer-form-section">
                        <form onSubmit={handleSubmit} className="answer-form">
                            <textarea
                                placeholder={currentUser ? `${currentUser.username}님, 의견을 남겨주세요...` : "댓글을 작성하려면 로그인하세요."}
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                className="answer-textarea"
                                rows="5"
                                disabled={!currentUser}
                            />
                            <div className="form-footer">
                                {submitStatus.message && <p className={`submit-status ${submitStatus.type}`}>{submitStatus.message}</p>}
                                <button type="submit" className="submit-answer-btn" disabled={!currentUser}><FaPaperPlane /> 댓글 등록</button>
                            </div>
                        </form>
                    </section>
    
                    <div className="list-button-container">
                        <button onClick={handleGoToList} className="list-button"><FaList /> 목록으로</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Board_detail;