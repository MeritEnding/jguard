package com.agent_Spring.agent_spring.question;

import com.agent_Spring.agent_spring.answer.AnswerDto;

import java.time.LocalDateTime;
import java.util.List;

public class QuestionDto {
    private Integer id;
    private String subject;
    private String content;
    private LocalDateTime createDate;
    private List<AnswerDto> answerList;
}
