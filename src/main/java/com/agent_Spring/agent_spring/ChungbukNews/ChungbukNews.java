package com.agent_Spring.agent_spring.ChungbukNews;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime; // LocalDateTime을 사용하기 위해 추가

@Entity
@Table(name="chungbuk_news")
@Getter
@Setter
public class ChungbukNews {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String url;

    // 새롭게 추가할 필드들
    private String source; // 뉴스 출처
    private LocalDateTime publishedAt; // 뉴스 발행 일시
    private String keyword; // 뉴스 키워드 (검색 등을 위해)
}