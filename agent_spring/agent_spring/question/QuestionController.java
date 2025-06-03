package com.agent_Spring.agent_spring.question;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/api")
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/questions")
    public Page<Question> list(@RequestParam(value="page", defaultValue="0") int page) {
        return questionService.getList(page);
    }

    @GetMapping("/board/detail/{id}")
    public Question detail(@PathVariable("id") Integer id){
        return this.questionService.getQuestion(id);
    }

    @PostMapping("question/create")
    public String questionCreate(@RequestBody Map<String, String> body) {
        String subject = body.get("subject");
        String content = body.get("content");

        this.questionService.create(subject, content);
        return "질문이 등록되었습니다.";
    }


}
