// News.jsx
import React, { useEffect, useState } from "react";
import "./News.css";
import Header from './Header';
import axiosInstance from './api/axiosInstance'; // 🟢 axiosInstance 임포트 추가

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true); // 🟢 로딩 상태 추가
  const [error, setError] = useState(null);     // 🟢 에러 상태 추가

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true); // 로딩 시작
      setError(null);   // 이전 에러 초기화

      try {
        // 🟢 fetch 대신 axiosInstance.get() 사용
        const res = await axiosInstance.get("http://localhost:8080/api/news");
        const data = res.data; // axios는 응답 데이터를 res.data에 담습니다.

        if (!Array.isArray(data)) {
          console.error("API 응답이 배열 형식이 아닙니다:", data);
          setNewsList([]);
          setError("뉴스 데이터를 불러오는 데 문제가 발생했습니다: 응답 형식이 올바르지 않습니다.");
          return;
        }

        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.source, // 백엔드 필드명에 맞게 'source' 사용
          link: item.url,       // 백엔드 필드명에 맞게 'url' 사용
          date: item.publishedAt ? item.publishedAt.substring(0, 10) : '날짜 정보 없음',
        }));
        setNewsList(formatted);
      } catch (err) {
        console.error("뉴스 로드 실패:", err);
        // 🟢 axios 에러 처리 방식에 맞게 수정
        if (err.response) {
          const errorMessage = err.response.data.message || err.response.data || "뉴스 데이터를 불러오지 못했습니다.";
          setError(`오류: ${errorMessage}`);
          // 401 Unauthorized나 403 Forbidden 등은 axiosInstance 인터셉터에서 처리될 것임
        } else if (err.request) {
          setError("네트워크 오류: 서버에 연결할 수 없습니다. 뉴스 데이터를 불러올 수 없습니다.");
        } else {
          setError(`요청 설정 오류: ${err.message}`);
        }
        setNewsList([]); // 에러 발생 시 뉴스 목록 초기화
      } finally {
        setLoading(false); // 로딩 완료 (성공/실패 무관)
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-container">
      <Header />
      <h1 className="news-title">전세 관련 뉴스 및 알림</h1>
      <p className="news-subtitle">최근 전세사기 사례 및 제도 변경 정보를 제공합니다.</p>

      <div className="news-grid">
        {loading ? ( // 🟢 로딩 중일 때 메시지
            <p className="loading-message">뉴스를 불러오는 중입니다...</p>
        ) : error ? ( // 🟢 에러 발생 시 메시지
            <p className="error-message">{error}</p>
        ) : newsList.length > 0 ? (
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