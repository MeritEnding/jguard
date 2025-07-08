import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Board.css"; // ✨ 완전히 새로워진 CSS 파일
import Header from './Header';
import axiosInstance from "./api/axiosInstance";
import { FaPen, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// 로딩 중일 때 보여줄 스켈레톤 행(row) 컴포넌트
const SkeletonRow = () => (
    <tr>
        <td><div className="skeleton-line short"></div></td>
        <td><div className="skeleton-line"></div></td>
        <td><div className="skeleton-line medium"></div></td>
        <td><div className="skeleton-line medium"></div></td>
    </tr>
);

const Board = () => {
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async (pageToFetch) => {
            setIsLoading(true);
            setError(null);
            try {
                // 시각적 확인을 위한 딜레이 (배포 시 제거)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const res = await axiosInstance.get(`/api/questions`, {
                    params: { page: pageToFetch }
                });
                const data = res.data;
                setQuestions(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
                setPage(data.number);
            } catch (err) {
                console.error("질문 목록 불러오기 실패:", err);
                if (err.response && err.response.status === 403) {
                    setError("게시판 접근 권한이 없습니다. 로그인 후 이용해주세요.");
                    // ✨ FIX: 경로 앞에 '/' 추가
                    navigate('/user/login');
                } else {
                    setError("게시글을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions(page);
    }, [page]);

    const handleRowClick = (id) => navigate(`detail/${id}`);
    const registerRowClick = () => navigate("question/create");
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "날짜 없음";
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="board-page-container">
            <Header />
            <main className="board-main-content">
                <div className="board-header">
                    <h1>사기 매물 공유</h1>
                    <p>전세 관련 사기 경험을 공유하고 다른 사람들의 피해를 예방하는 소중한 정보를 나누세요.</p>
                </div>

                <div className="board-table-container">
                    <table className="board-table">
                        <thead>
                            <tr>
                                <th className="col-number">번호</th>
                                <th className="col-title">제목</th>
                                <th className="col-author">작성자</th>
                                <th className="col-date">작성일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
                            ) : error ? (
                                <tr>
                                    {/* ✨ FIX: 4개의 컬럼을 병합하도록 colSpan 수정 */}
                                    <td colSpan="4" className="status-cell error">{error}</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="status-cell">등록된 게시글이 없습니다.</td>
                                </tr>
                            ) : (
                                questions.map((q, idx) => (
                                    <tr key={q.id} onClick={() => handleRowClick(q.id)}>
                                        <td>{totalElements - (page * 10 + idx)}</td>
                                        <td className="cell-title">
                                            {q.subject}
                                            {q.answerList?.length > 0 && (
                                                <span className="answer-count">[{q.answerList.length}]</span>
                                            )}
                                        </td>
                                        <td>{q.author?.username || "알 수 없음"}</td>
                                        <td>{formatDate(q.createDate)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="board-footer">
                    <div className="total-elements">총 {totalElements}개 게시물</div>
                    {!isLoading && totalPages > 0 && (
                        <div className="pagination">
                            <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
                                <FaChevronLeft />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                (i >= Math.max(0, page - 2) && i <= Math.min(totalPages - 1, page + 2)) && (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={i === page ? "active" : ""}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            ))}
                            <button onClick={() => handlePageChange(page + 1)} disabled={page + 1 >= totalPages}>
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                    <button className="board-register-btn" onClick={registerRowClick}>
                        <FaPen /> 글쓰기
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Board;