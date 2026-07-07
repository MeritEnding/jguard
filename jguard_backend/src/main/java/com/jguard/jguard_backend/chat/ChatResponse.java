package com.jguard.jguard_backend.chat;

import lombok.Builder;
import lombok.Getter;

/** 전세사기 Q&A 챗봇 응답 */
@Getter
@Builder
public class ChatResponse {

    /** 답변 본문 (마크다운) */
    private String reply;

    /** 답변 출처: llm(OpenAI) | kb(내장 지식베이스) */
    private String source;
}
