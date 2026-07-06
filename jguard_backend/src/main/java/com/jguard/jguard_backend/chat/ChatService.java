package com.jguard.jguard_backend.chat;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 전세사기 Q&A 챗봇.
 * OpenAI API 키가 설정돼 있으면 LLM(변호사 페르소나)으로 답변하고,
 * 키가 없거나 호출이 실패하면 내장 지식베이스로 폴백한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    /** AI_변호사_Agent 노트북의 페르소나·원칙을 상담 챗봇용으로 정리한 시스템 프롬프트 */
    private static final String SYSTEM_PROMPT = """
            당신은 15년 경력의 대한민국 부동산 전문 변호사이자 전세사기 예방 상담가입니다.
            수천 건의 전세 계약·전세사기 사례를 분석한 경험을 바탕으로 세입자의 질문에 답합니다.

            답변 원칙:
            1. 대한민국의 주택임대차보호법, 전세사기피해자 특별법 등 실제 법·제도에 근거해 답한다.
            2. 어려운 법률 용어는 쉬운 말로 풀어 설명하고, 핵심을 먼저 말한 뒤 근거를 덧붙인다.
            3. 사용자가 당장 실행할 수 있는 구체적 행동(어디서, 무엇을, 어떻게)을 제시한다.
            4. 마크다운(굵게, 목록)을 활용해 읽기 쉽게 구성하되, 400자 내외로 간결하게 답한다.
            5. 확실하지 않은 내용은 단정하지 말고, 개별 사안은 전세피해지원센터(1533-8119)나
               변호사 상담을 권한다.
            6. 전세사기와 무관한 질문에는 "전세사기·임대차 관련 질문에 답변드리는 상담가"라고
               정중히 안내하고 관련 주제를 제안한다.
            """;

    private final JeonseKnowledgeBase knowledgeBase;

    @Value("${jguard.api.openai.key:${OPENAI_API_KEY:}}")
    private String openaiKey;

    @Value("${jguard.api.openai.model:gpt-4o-mini}")
    private String openaiModel;

    public ChatResponse chat(ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("질문을 입력해주세요.");
        }

        if (openaiKey != null && !openaiKey.isBlank()) {
            try {
                return ChatResponse.builder()
                        .reply(askOpenAi(request))
                        .source("llm")
                        .build();
            } catch (Exception e) {
                log.warn("OpenAI 호출 실패, 지식베이스로 폴백: {}", e.getMessage());
            }
        }

        String answer = knowledgeBase.findAnswer(request.getMessage())
                .orElse(knowledgeBase.defaultAnswer());
        return ChatResponse.builder()
                .reply(answer)
                .source("kb")
                .build();
    }

    private String askOpenAi(ChatRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        if (request.getHistory() != null) {
            // 컨텍스트 폭주 방지를 위해 최근 10턴만 사용
            int from = Math.max(0, request.getHistory().size() - 10);
            for (ChatRequest.Turn turn : request.getHistory().subList(from, request.getHistory().size())) {
                String role = "assistant".equals(turn.getRole()) ? "assistant" : "user";
                messages.add(Map.of("role", role, "content", turn.getContent()));
            }
        }
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        RestClient client = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + openaiKey)
                .build();

        JsonNode response = client.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "model", openaiModel,
                        "temperature", 0.3,
                        "max_tokens", 700,
                        "messages", messages
                ))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || response.path("choices").isEmpty()) {
            throw new IllegalStateException("OpenAI 응답이 비어 있습니다.");
        }
        return response.path("choices").get(0).path("message").path("content").asText();
    }
}
