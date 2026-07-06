// News.jsx
import React, { useEffect, useState } from "react";
import "./News.css"; // 개선된 CSS 파일을 임포트합니다.
import Header from './Header';
import axiosInstance from './api/axiosInstance';
import { FaExclamationTriangle, FaArrowRight } from 'react-icons/fa'; // 아이콘 추가

// ✨ New: 스켈레톤 카드 컴포넌트
const SkeletonCard = () => (
  <div className="news-card skeleton">
    <div className="skeleton-line title"></div>
    <div className="skeleton-line text"></div>
    <div className="skeleton-line text short"></div>
    <div className="skeleton-line tag"></div>
    <div className="skeleton-line button"></div>
  </div>
);

const Chungcheong = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1.5초 딜레이를 주어 로딩 효과를 시각적으로 확인 (실제 배포 시에는 제거)
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const res = await axiosInstance.get("/api/chungbuk_news"); // 상대 경로 사용 권장
        const data = res.data;

        if (!Array.isArray(data)) {
          console.error("API 응답이 배열 형식이 아닙니다:", data);
          throw new Error("뉴스 데이터를 불러오는 데 문제가 발생했습니다.");
        }

        const formatted = data.map((item, index) => ({
          id: item.id || index,
          title: item.title,
          link: item.url,
          source: item.source,
          publishedAt: item.publishedAt,
          keyword: item.keyword
        }));

        setNewsList(formatted);
      } catch (err) {
        console.error("뉴스 로드 실패:", err);
        if (err.response) {
          setError(err.response.data.message || "뉴스 데이터를 불러오지 못했습니다.");
        } else if (err.request) {
          setError("네트워크 오류: 서버에 연결할 수 없습니다.");
        } else {
          setError(err.message || "요청 중 오류가 발생했습니다.");
        }
        setNewsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-page-container">
      <Header />
      <main className="news-main-content">
        <div className="news-header">
          <h1 className="news-page-title">충청북도 지역 뉴스</h1>
          <p className="news-page-subtitle">AI가 분석한 충북 지역의 최신 전세 관련 소식을 확인하세요.</p>
        </div>

        <div className="news-grid">
          {loading ? (
            // ✨ Change: 로딩 중일 때 스켈레톤 카드 6개를 보여줍니다.
            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
          ) : error ? (
            <div className="message-box error">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          ) : newsList.length > 0 ? (
            newsList.map((news) => (
              <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-card-link" key={news.id}>
                <div className="news-card">
                  {/* ✨ Change: 콘텐츠를 그룹핑하여 레이아웃 제어 용이성 확보 */}
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span className="news-source">{news.source}</span>
                      <span className="news-date">
                        {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : '날짜 없음'}
                      </span>
                    </div>
                    {news.keyword && <span className="news-keyword-tag">{news.keyword}</span>}
                  </div>
                  <div className="news-card-footer">
                    자세히 보기 <FaArrowRight />
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="message-box">
              <p>표시할 뉴스가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chungcheong;