import React, { useEffect, useState } from "react";
import "./MyPage.css";

const Mypage = () => {
  const [userInfo, setUserInfo] = useState({
    username: "이정훈",
    email: "jeonghoon@example.com",
    joinDate: "2025-04-15",
  });

  const [myPosts, setMyPosts] = useState([
    {
      id: 1,
      title: "전세 계약서에 확정일자 안 찍혔어요",
      date: "2025-05-10",
    },
    {
      id: 2,
      title: "임대인 연락 두절, 어떻게 해야 하나요?",
      date: "2025-05-22",
    },
  ]);

  const [myChats, setMyChats] = useState([
    {
      id: 1,
      question: "임대인 명의 확인 방법이 궁금해요.",
      date: "2025-05-29",
    },
    {
      id: 2,
      question: "보증보험 가입 여부 확인하는 법은?",
      date: "2025-05-31",
    },
  ]);

  return (
    <div className="mypage-container">
      <h1 className="mypage-title">마이페이지</h1>

      <section className="mypage-section">
        <h2>👤 내 정보</h2>
        <p><strong>이름:</strong> {userInfo.username}</p>
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>가입일:</strong> {userInfo.joinDate}</p>
      </section>

      <section className="mypage-section">
        <h2>📝 내가 작성한 질문</h2>
        <ul className="mypage-list">
          {myPosts.length === 0 ? (
            <p>작성한 질문이 없습니다.</p>
          ) : (
            myPosts.map((post) => (
              <li key={post.id}>
                <strong>{post.title}</strong> <span>({post.date})</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mypage-section">
        <h2>💬 챗봇 상담 내역</h2>
        <ul className="mypage-list">
          {myChats.length === 0 ? (
            <p>상담 내역이 없습니다.</p>
          ) : (
            myChats.map((chat) => (
              <li key={chat.id}>
                <strong>{chat.question}</strong> <span>({chat.date})</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default Mypage;
