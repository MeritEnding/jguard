// com.agent_Spring.agent_spring.news.NewsController.java
package com.agent_Spring.agent_spring.news;

import com.agent_Spring.agent_spring.question.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // 엔드포인트 경로를 변경하여 뉴스 API와 구분 (선택 사항)
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
class NewsController { // Controller 이름도 TrendController 등으로 변경 권장

    private final NewsService newsService; // 서비스 이름이 변경되었다면 그에 맞게 수정

    @GetMapping("/trend") // /api/trend 로 요청 시 검색어 트렌드 데이터 반환
    public KeywordTrendData getKeywordTrendData() {
        return newsService.getKeywordTrendData();
    }

    @GetMapping("/news")
    public List<News> getLatestNewsArticles(){
        // *** 여기가 핵심 수정 부분입니다! ***
        // 클라이언트 요청 시 Gnews API를 호출하는 대신,
        // 이미 DB에 저장된 최신 뉴스만 반환하도록 변경합니다.
        return newsService.getLatestNews();
    }

//    @GetMapping("/news/fetch")
//    public ResponseEntity<String> fetchNewsNow() {
//        newsService.fetchNews();
//        return ResponseEntity.ok("뉴스 수집 실행됨");
//    }
}