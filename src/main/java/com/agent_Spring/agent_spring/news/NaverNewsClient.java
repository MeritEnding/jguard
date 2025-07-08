package com.agent_Spring.agent_spring.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter; // DateTimeFormatter 추가 (날짜 파싱에 사용)
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.URI;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets; // StandardCharsets 추가

@Component // 스프링 빈으로 등록
class NaverNewsClient {
    private static final String NAVER_CLIENT_ID = "rk53wrPaeG6oA_p2IUWi";
    private static final String NAVER_CLIENT_SECRET = "pr_10pQXIi";

    private static final String BASE_URL = "https://openapi.naver.com/v1/search/news.json"; // 네이버 뉴스 API 엔드포인트

    private final HttpClient httpClient = HttpClient.newHttpClient(); // HttpClient는 한 번만 생성하여 재사용

    public List<News> fetch(String keyword) {
        List<News> result = new ArrayList<>();
        try {
            // 네이버 뉴스 API 요청 URL 구성
            // query: 검색어 (UTF-8 인코딩)
            // display: 검색 결과 개수 (10개 고정. 네이버는 max=1 대신 display 파라미터 사용)
            // sort: 정렬 옵션 (sim:유사도순, date:날짜순. 기본은 sim)
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8.toString());
            String url = String.format("%s?query=%s&display=10&sort=date", BASE_URL, encodedKeyword);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Naver-Client-Id", NAVER_CLIENT_ID) // Client ID 헤더 추가
                    .header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET) // Client Secret 헤더 추가
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // 디버깅을 위해 API 응답 본문 출력
            System.out.println("Naver News API Response for keyword '" + keyword + "': " + response.body());

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode json = objectMapper.readTree(response.body());
            JsonNode items = json.get("items"); // 네이버 뉴스는 'items' 배열 안에 기사 목록이 있습니다.

            // 'items' 노드가 존재하고 배열 형태인지 확인
            if (items != null && items.isArray()) {
                for (JsonNode item : items) { // JsonNode 타입 명시
                    // 네이버 뉴스 API 응답 필드 이름에 맞춰 변경
                    String titleHtml = item.has("title") ? item.get("title").asText() : "제목 없음";
                    // 네이버 API는 제목에 HTML 태그(<b>, </b>)가 포함되어 올 수 있으므로 제거
                    String title = titleHtml.replaceAll("<[^>]*>", "");

                    String articleUrl = item.has("link") ? item.get("link").asText() : ""; // 'link' 필드
                    String sourceName = item.has("publisher") ? item.get("publisher").asText() : "출처 불명"; // 'publisher' 필드
                    String publishedAtText = item.has("pubDate") ? item.get("pubDate").asText() : null; // 'pubDate' 필드 (RFC 822 포맷)

                    LocalDateTime publishedAt = null;
                    if (publishedAtText != null) {
                        try {
                            // 네이버 'pubDate' 형식 (RFC 822): "Sat, 04 May 2024 12:00:00 +0900"
                            // LocalDateTime.parse에는 기본적으로 이 형식이 없으므로 DateTimeFormatter 사용
                            // RFC 822를 파싱하는 형식은 'EEE, dd MMM yyyy HH:mm:ss Z' 입니다.
                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z");
                            publishedAt = LocalDateTime.parse(publishedAtText, formatter);

                        } catch (DateTimeParseException dtpe) {
                            System.err.println("Error parsing date '" + publishedAtText + "' for keyword '" + keyword + "': " + dtpe.getMessage());
                        }
                    }

                    result.add(News.builder()
                            .title(title)
                            .url(articleUrl)
                            .source(sourceName)
                            .publishedAt(publishedAt)
                            .keyword(keyword)
                            .build());
                }
            } else {
                System.out.println("No 'items' found or 'items' is not an array for keyword: " + keyword);
                System.out.println("Full Naver News API response: " + json.toPrettyString());
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to fetch news for keyword '" + keyword + "': " + e.getMessage());
            return List.of();
        }
    }
}