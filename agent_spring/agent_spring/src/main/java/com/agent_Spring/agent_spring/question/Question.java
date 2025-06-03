package com.agent_Spring.agent_spring.question;

import com.agent_Spring.agent_spring.answer.Answer;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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
}
