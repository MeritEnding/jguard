package com.agent_Spring.agent_spring.news;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.ErrorResponse;

import java.time.LocalDateTime;

@Entity
@Data // @Data 어노테이션이 @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor를 포함합니다.
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class News {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique=true)
    private String title;

    @Column(nullable = false)
    private String url;

    private String source;
    private LocalDateTime publishedAt;
    private String keyword;


}
