package com.agent_Spring.agent_spring.news;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeywordTrendData {
    private String startDate; // 요청한 시작 날짜
    private String endDate;   // 요청한 종료 날짜
    private String timeUnit;  // 시간 단위 (date, week, month)
    private List<KeywordTrendResult> results; // 각 키워드 그룹별 결과 목록

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KeywordTrendResult {
        private String title; // 키워드 그룹 이름 (예: "전세사기")
        private List<Map<String, Object>> data; // 실제 검색량 데이터 (period, ratio)
    }
}