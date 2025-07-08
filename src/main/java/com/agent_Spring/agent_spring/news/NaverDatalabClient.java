// com.agent_Spring.agent_spring.news.NaverDatalabClient.java
package com.agent_Spring.agent_spring.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
class NaverDatalabClient {

    // TODO: 여기에 네이버 개발자 센터에서 발급받은 '데이터랩 (검색어트렌드)' API용 ID/Secret을 입력하세요!
    // 실제 서비스에서는 이 값들을 환경 변수나 설정 파일에서 로드하는 것이 보안상 안전합니다.
    private static final String NAVER_CLIENT_ID = "api아이디";
    private static final String NAVER_CLIENT_SECRET = "api키";
    private static final String BASE_URL = "https://openapi.naver.com/v1/datalab/search";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 키워드 배열을 받아 검색어 트렌드 데이터를 가져오는 메서드
    public KeywordTrendData fetchKeywordTrend(List<String> keywords) {
        try {
            // 요청 기간 설정 (예시: 최근 6개월, 현재 날짜 기준)
            // 'month' 단위로 데이터를 가져올 때는 시작일과 종료일이 월의 첫날이어야 정확합니다.
            // 하지만 API는 자동으로 월 단위로 맞춰주므로, YYYY-MM-DD 형식으로 보내도 됩니다.
            String endDate = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            String startDate = LocalDate.now().minusMonths(6).format(DateTimeFormatter.ISO_DATE); // 최근 6개월 데이터 예시

            // 요청 본문 JSON 구성
            ObjectNode requestBodyJson = objectMapper.createObjectNode();
            requestBodyJson.put("startDate", startDate);
            requestBodyJson.put("endDate", endDate);
            requestBodyJson.put("timeUnit", "month"); // <-- 핵심 변경: "month"로 설정!

            // keywordGroups 배열 생성
            ArrayNode keywordGroupsNode = objectMapper.createArrayNode();
            for (String keyword : keywords) {
                keywordGroupsNode.add(
                        objectMapper.createObjectNode()
                                .put("groupName", keyword)
                                .set("keywords", objectMapper.createArrayNode().add(keyword)) // 단일 키워드 그룹
                );
            }
            requestBodyJson.set("keywordGroups", keywordGroupsNode);

            // device, ages, gender 등 추가 파라미터는 필요시 여기에 추가
            // requestBodyJson.put("device", "pc");
            // requestBodyJson.set("ages", objectMapper.createArrayNode().add("1").add("2")); // 10대, 20대

            String requestBody = objectMapper.writeValueAsString(requestBodyJson);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL))
                    .header("X-Naver-Client-Id", NAVER_CLIENT_ID)
                    .header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("Naver Datalab Trend API Request Failed. Status Code: " + response.statusCode());
                System.err.println("Response Body: " + response.body());
                return null;
            }

            System.out.println("Naver Datalab Trend API Response: " + response.body());

            // 응답 JSON을 KeywordTrendData DTO로 파싱
            JsonNode rootNode = objectMapper.readTree(response.body());

            List<KeywordTrendData.KeywordTrendResult> results = new ArrayList<>();
            JsonNode resultsNode = rootNode.get("results");
            if (resultsNode != null && resultsNode.isArray()) {
                for (JsonNode resultNode : resultsNode) {
                    String title = resultNode.get("title").asText();
                    List<Map<String, Object>> data = new ArrayList<>();
                    JsonNode dataNodes = resultNode.get("data");
                    if (dataNodes != null && dataNodes.isArray()) {
                        for (JsonNode dataNode : dataNodes) {
                            data.add(objectMapper.convertValue(dataNode, Map.class));
                        }
                    }
                    results.add(KeywordTrendData.KeywordTrendResult.builder()
                            .title(title)
                            .data(data)
                            .build());
                }
            }

            return KeywordTrendData.builder()
                    .startDate(rootNode.get("startDate").asText())
                    .endDate(rootNode.get("endDate").asText())
                    .timeUnit(rootNode.get("timeUnit").asText())
                    .results(results)
                    .build();

        } catch (IOException | InterruptedException e) {
            System.err.println("Error fetching Naver Datalab Trend: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}