// News.jsx
import React, { useEffect, useState } from "react";
import "./News.css";
import Header from './Header';

const News = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    
    fetch("http://localhost:8080/api/news") // <--- 여기가 핵심
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP 오류! 상태: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("API 응답이 배열 형식이 아닙니다:", data);
          setNewsList([]);
          return;
        }

        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.source,
          link: item.url,
          date: item.publishedAt ? item.publishedAt.substring(0, 10) : '날짜 정보 없음',
        }));
        setNewsList(formatted);
      })
      .catch((err) => {
        console.error("뉴스 로드 실패:", err);
        setNewsList([]);
      });
  }, []);

  return (
    <div className="news-container">
      <Header />
      <h1 className="news-title">전세 관련 뉴스 및 알림</h1>
      <p className="news-subtitle">최근 전세사기 사례 및 제도 변경 정보를 제공합니다.</p>

      <div className="news-grid">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <div className="news-card" key={news.id}>
              <h3>{news.title}</h3>
              <p className="news-date">{news.date}</p>
              <p className="news-summary">{news.summary}</p>
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-link"
              >
                자세히 보기 →
              </a>
            </div>
          ))
        ) : (
          <p className="no-news-message">최신 전세 관련 뉴스가 없습니다. 잠시 후 다시 시도하거나, 백엔드 서버 상태를 확인해주세요.</p>
        )}
      </div>
    </div>
  );
};

export default News;