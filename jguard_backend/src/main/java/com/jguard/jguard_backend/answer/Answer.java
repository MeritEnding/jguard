package com.jguard.jguard_backend.answer;

import com.jguard.jguard_backend.question.Question;
import com.jguard.jguard_backend.user.SiteUser;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Answer {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition="TEXT")
    private String content;

    private LocalDateTime createDate;

    @ManyToOne
    @JsonBackReference
    private Question question;

    private LocalDateTime modifyDate;

    @ManyToOne
    private SiteUser author;

}
