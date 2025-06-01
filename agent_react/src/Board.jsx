import React, { useState } from "react";
import "./Board.css";

const Board = () => {
  const [posts, setPosts] = useState([
    // 예시 게시글
    { id: 1, title: "첫 질문입니다.", createDate: "2025-06-01 10:00" },
    { id: 2, title: "React 질문", createDate: "2025-06-02 12:30" },
  ]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="board-container">
      <h1 className="board-title">전세 상담 게시판</h1>
      <p className="board-description">전세 관련 질문을 공유하고 정보를 나누세요.</p>

      {/* 게시글 목록 */}
      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일시</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                등록된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            posts.map((post, idx) => (
              <tr key={post.id}>
                <td>{posts.length - idx}</td>
                <td>{post.title}</td>
                <td>{post.createDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 등록 버튼 */}
      <button
        className="board-register-btn"
        onClick={() => setShowForm(true)}
      >
        질문 등록하기
      </button>

      {/* 등록 폼 (showForm이 true일 때만 보여줌) */}
      {showForm && (
        <form className="board-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="제목" className="board-input" />
          <textarea placeholder="내용을 입력하세요..." className="board-textarea" rows={4}></textarea>
          <button type="submit" className="board-submit-btn">
            등록
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="board-cancel-btn"
          >
            취소
          </button>
        </form>
      )}
    </div>
  );
};

export default Board;
