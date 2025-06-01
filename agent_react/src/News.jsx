import React, { useEffect, useState } from "react";
import "./News.css";

const sampleNews = [
  {
    id: 1,
    title: "서울서 또 전세사기…청년 전세금 5억 증발",
    summary: "임대인이 허위 확정일자와 이중계약으로 수십 명 피해 발생. 피해자 대부분 2030 청년.",
    link: "https://news.example.com/1",
    date: "2025-05-28",
  },
  {
    id: 2,
    title: "정부, 전세사기 특별단속 연장 발표",
    summary: "전세사기 피해 확산에 따라 국토부와 경찰청 합동 단속 연장. 피해자 지원책 강화 예정.",
    link: "https://news.example.com/2",
    date: "2025-05-30",
  },
  {
    id: 3,
    title: "확정일자 제도 개편…임차인 보호 확대",
    summary: "확정일자 신청 절차 간소화 및 보증금 반환 순위 우선권 제도 도입 예정.",
    link: "https://news.example.com/3",
    date: "2025-06-01",
  },
];

const News = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    // 실제 뉴스 API 연동 가능
    setNewsList(sampleNews);
  }, []);

  return (
    <div className="news-container">
      <h1 className="news-title">전세 관련 뉴스 및 알림</h1>
      <p className="news-subtitle">최근 전세사기 사례 및 제도 변경 정보를 제공합니다.</p>

      <div className="news-grid">
        {newsList.map((news) => (
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
        ))}
      </div>
    </div>
  );
};

export default News;
