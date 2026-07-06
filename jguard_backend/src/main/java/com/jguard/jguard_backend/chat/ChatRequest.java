package com.jguard.jguard_backend.chat;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/** 전세사기 Q&A 챗봇 요청 */
@Getter
@Setter
public class ChatRequest {

    /** 사용자 질문 */
    private String message;

    /** 이전 대화 (오래된 것부터) */
    private List<Turn> history;

    @Getter
    @Setter
    public static class Turn {
        /** user | assistant */
        private String role;
        private String content;
    }
}
