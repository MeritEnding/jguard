package com.agent_Spring.agent_spring.ChungbukNews;

import java.time.LocalDateTime; // LocalDateTime을 사용하기 위해 추가

public class ChungbukNewsDto {
    private String title;
    private String url;
    private String source; // 추가
    private LocalDateTime publishedAt; // 추가
    private String keyword; // 추가

    public ChungbukNewsDto(String title, String url, String source, LocalDateTime publishedAt, String keyword) { // 생성자 수정
        this.title = title;
        this.url = url;
        this.source = source; // 추가
        this.publishedAt = publishedAt; // 추가
        this.keyword = keyword; // 추가
    }

    public String getTitle() { return title; }
    public String getUrl() { return url; }
    public String getSource() { return source; } // Getter 추가
    public LocalDateTime getPublishedAt() { return publishedAt; } // Getter 추가
    public String getKeyword() { return keyword; } // Getter 추가

    // 필요하다면 Setter도 추가할 수 있습니다. (DTO에서 변경이 필요한 경우)
    // public void setTitle(String title) { this.title = title; }
    // public void setUrl(String url) { this.url = url; }
    // public void setSource(String source) { this.source = source; }
    // public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    // public void setKeyword(String keyword) { this.keyword = keyword; }
}