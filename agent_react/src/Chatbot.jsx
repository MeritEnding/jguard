import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "안녕하세요! 전세사기 예방 챗봇입니다. 무엇이 궁금하신가요?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 예시 응답 (LLM 또는 백엔드 연동 가능)
  const getBotResponse = (userText) => {
    if (userText.includes("등기부등본")) {
      return "등기부등본을 열람하여 임대인이 진짜 소유자인지 확인하세요.";
    } else if (userText.includes("확정일자")) {
      return "확정일자는 동사무소 또는 온라인으로 신청 가능하며, 전세보증금 보호에 중요합니다.";
    } else {
      return "죄송해요, 해당 질문은 아직 학습되지 않았어요. 다른 질문을 해보세요!";
    }
  };

  // 메시지 전송
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage = { type: "user", text: input };
    const botMessage = { type: "bot", text: getBotResponse(input) };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">전세사기 예방 챗봇</h2>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.type}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="예) 확정일자 꼭 받아야 하나요?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default Chatbot;
