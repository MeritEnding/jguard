package com.agent_Spring.agent_spring.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.URI;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Component
class NaverNewsClient {
    // **이 값들은 네이버 '검색 API' -> '뉴스' 서비스를 활성화했을 때 발급받는 ID/Secret 이어야 합니다.**
    private static final String NAVER_CLIENT_ID = "apiid";    // 실제 발급받은 Client ID로 변경
    private static final String NAVER_CLIENT_SECRET = "api키"; // 실제 발급받은 Client Secret으로 변경

    // **네이버 뉴스 검색 API의 실제 엔드포인트 URL입니다.**
    private static final String BASE_URL = "https://openapi.naver.com/v1/search/news.json";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    // NewsService에서 호출하는 'fetch' 메서드입니다.
    public List<News> fetch(String keyword) {
        List<News> result = new ArrayList<>();
        try {
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8.toString());
            // display는 한 번에 가져올 검색 결과 개수 (최대 100). sort=date는 최신순 정렬.
            String url = String.format("%s?query=%s&display=10&sort=date", BASE_URL, encodedKeyword);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Naver-Client-Id", NAVER_CLIENT_ID) // Client ID 헤더 추가
                    .header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET) // Client Secret 헤더 추가
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // API 호출이 실패했을 경우 (HTTP 상태 코드 200 OK가 아닌 경우) 로그 출력
            if (response.statusCode() != 200) {
                System.err.println("Naver News API Request Failed for keyword '" + keyword + "'. Status Code: " + response.statusCode());
                System.err.println("Response Body: " + response.body());
                return List.of(); // 빈 리스트 반환하여 다음 처리로 넘김
            }

            // 디버깅을 위해 API 응답 본문 출력 (중요!)
            System.out.println("Naver News API Response for keyword '" + keyword + "': " + response.body());

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode json = objectMapper.readTree(response.body());
            JsonNode items = json.get("items"); // 네이버 뉴스 API는 'items' 배열 안에 기사 목록이 있습니다.

            // 'items' 노드가 존재하고 배열 형태인지 확인
            if (items != null && items.isArray()) {
                // 네이버 'pubDate' 형식 (RFC 822)에 맞는 DateTimeFormatter 정의: "Sat, 04 May 2024 12:00:00 +0900"
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z");

                for (JsonNode item : items) {
                    // 제목에 포함될 수 있는 HTML 태그 제거
                    String titleHtml = item.has("title") ? item.get("title").asText() : "제목 없음";
                    String title = titleHtml.replaceAll("<[^>]*>", "");

                    String articleUrl = item.has("link") ? item.get("link").asText() : "";
                    String sourceName = item.has("publisher") ? item.get("publisher").asText() : "출처 불명";
                    String publishedAtText = item.has("pubDate") ? item.get("pubDate").asText() : null;

                    LocalDateTime publishedAt = null;
                    if (publishedAtText != null) {
                        try {
                            publishedAt = LocalDateTime.parse(publishedAtText, formatter);
                        } catch (DateTimeParseException dtpe) {
                            System.err.println("Error parsing date '" + publishedAtText + "' for keyword '" + keyword + "': " + dtpe.getMessage());
                            // 날짜 파싱 오류 시 publishedAt은 null로 유지
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
            System.err.println("Critical error fetching news for keyword '" + keyword + "': " + e.getMessage());
            e.printStackTrace(); // 스택 트레이스도 출력하여 상세 오류 확인
            return List.of();
        }
    }
}