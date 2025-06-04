// com.agent_Spring.agent_spring.news.NewsService.java
package com.agent_Spring.agent_spring.news;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
class NewsService {

    private final NewsRepository newsRepository;
    private final NaverDatalabClient naverDatalabClient;
    private final GnewsClient gnewsClient;

    private static final List<String> KEYWORDS = List.of("전세사기");
    private static final List<String> KEYWORDS1 = List.of("Jeonse Fraud Special Act", "Rental Deposit Guarantee", "Tin Rent Victims Support",
            "LH Damaged House Purchase", "Lease Fraud Countermeasures");


    public KeywordTrendData getKeywordTrendData() {
        return naverDatalabClient.fetchKeywordTrend(KEYWORDS);
    }

    public List<News> getLatestNews() {
        return newsRepository.findTop20ByOrderByPublishedAtDesc();
    }

    @Scheduled(cron = "0 0 0 * * *") // 매일 자정에 실행
    public void fetchNews() {
        for (String keyword : KEYWORDS1) {
            try {
                List<News> articles = gnewsClient.fetch(keyword);
                for (News article : articles) {
                    if (!newsRepository.existsByTitle(article.getTitle())) {
                        newsRepository.save(article);
                    }
                }
                Thread.sleep(1000); // 요청 간 지연 추가
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    System.err.println("Gnews API 속도 제한에 도달했습니다. 잠시 후 다시 시도합니다.");
                    try {
                        Thread.sleep(5000); // 429 오류 시 더 긴 시간 대기
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    System.err.println("뉴스 가져오기 중 오류 발생: " + e.getMessage());
                }
            }
        }
    }


}