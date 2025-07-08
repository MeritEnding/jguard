package com.agent_Spring.agent_spring.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper; // ObjectMapper 임포트 추가
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.URI;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets; // StandardCharsets 임포트 추가 (권장)

@Component
class GnewsClient {
    private static final String API_KEY = "api키";
    private static final String BASE_URL = "https://gnews.io/api/v4/search";

    private final HttpClient httpClient = HttpClient.newHttpClient(); // HttpClient 인스턴스 재사용
    private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper 인스턴스 재사용

    public List<News> fetch(String keyword) {
        // API 키 유효성 검사는 이제 필요 없습니다. (이미 하드코딩 되어있으므로)
        // 만약 빈 문자열로 설정될 가능성이 있다면 이 검사를 다시 추가할 수 있습니다.

        try {
            // --- 여기를 수정했습니다: max=5로 설정하여 기사 5개만 가져오도록 변경 ---
            var url = String.format("%s?q=%s&token=%s&lang=ko&max=5", // max를 5로 변경
                    BASE_URL, URLEncoder.encode(keyword, StandardCharsets.UTF_8), API_KEY); // UTF-8 인코딩 명시

            var request = HttpRequest.newBuilder().uri(URI.create(url)).build();
            var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // 디버깅을 위해 API 응답 본문 출력
            System.out.println("Gnews API Response for keyword '" + keyword + "': " + response.body());

            // HTTP 응답 코드가 200 (OK)이 아닌 경우 처리
            if (response.statusCode() != 200) {
                System.err.println("Gnews API 요청 실패. 상태 코드: " + response.statusCode());
                System.err.println("응답 본문: " + response.body());
                return List.of(); // 실패 시 빈 리스트 반환
            }

            JsonNode json = objectMapper.readTree(response.body());
            JsonNode articles = json.get("articles");

            List<News> result = new ArrayList<>();

            // 'articles' 노드가 존재하고 배열 형태인지 확인
            if (articles != null && articles.isArray()) {
                // --- 여기를 수정했습니다: 'break;' 문을 제거하여 모든 기사를 추가하도록 함 ---
                for (JsonNode article : articles) { // JsonNode 타입 명시
                    // 각 필드가 존재하는지 먼저 확인 후 안전하게 추출
                    String title = article.has("title") ? article.get("title").asText() : "제목 없음";
                    String articleUrl = article.has("url") ? article.get("url").asText() : "";
                    String sourceName = (article.has("source") && article.get("source").has("name"))
                            ? article.get("source").get("name").asText() : "출처 불명";
                    String publishedAtText = article.has("publishedAt") ? article.get("publishedAt").asText() : null;
                    LocalDateTime publishedAt = null;

                    if (publishedAtText != null && publishedAtText.length() >= 19) {
                        try {
                            // publishedAt 형식 문제 방지를 위해 정확히 0~18 인덱스까지 파싱 (밀리초 제거)
                            publishedAt = LocalDateTime.parse(publishedAtText.substring(0, 19));
                        } catch (DateTimeParseException dtpe) {
                            System.err.println("날짜 파싱 오류 ('" + publishedAtText + "') for 키워드 '" + keyword + "': " + dtpe.getMessage());
                            // 날짜 파싱 오류 시 publishedAt은 null로 유지
                        }
                    }

                    result.add(News.builder()
                            .title(title)
                            .url(articleUrl)
                            .source(sourceName)
                            .publishedAt(publishedAt) // null일 가능성을 고려
                            .keyword(keyword)
                            .build());

                    // *** 중요: max=5로 변경하고 5개 모두 가져와야 하므로, 여기서 'break;'를 제거했습니다. ***
                    // break; // 이 줄을 제거했습니다!
                }
            } else {
                System.out.println("키워드 '" + keyword + "'에 대해 'articles' 노드가 없거나 배열이 아닙니다.");
                System.out.println("전체 Gnews API 응답: " + json.toPrettyString()); // 전체 응답 출력
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace(); // 어떤 예외가 발생했는지 콘솔에 출력
            System.err.println("키워드 '" + keyword + "'에 대한 뉴스 가져오기 실패: " + e.getMessage());
            return List.of(); // 예외 발생 시 빈 리스트 반환
        }
    }
}