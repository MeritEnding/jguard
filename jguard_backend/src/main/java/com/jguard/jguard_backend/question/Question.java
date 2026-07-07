package com.jguard.jguard_backend.question;

import com.jguard.jguard_backend.answer.Answer;
import com.jguard.jguard_backend.user.SiteUser;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition="TEXT")
    private String content;

    private LocalDateTime createDate;

    @OneToMany(mappedBy="question", cascade=CascadeType.REMOVE)
    @JsonManagedReference
    private List<Answer> answerList;

    private LocalDateTime modifyDate;

    @ManyToOne
    private SiteUser author;


}
