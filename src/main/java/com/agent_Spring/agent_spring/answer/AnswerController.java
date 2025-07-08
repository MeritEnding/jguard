package com.agent_Spring.agent_spring.answer;

import com.agent_Spring.agent_spring.question.Question;
import com.agent_Spring.agent_spring.question.QuestionService;
import com.agent_Spring.agent_spring.user.SiteUser;
import com.agent_Spring.agent_spring.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/answer")
@CrossOrigin(origins = "http://localhost:3000") // React 개발 서버 주소
public class AnswerController {

    private final QuestionService questionService;
    private final AnswerService answerService; // 실제로 답변 저장하는 서비스 필요
    private final UserService userService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create/{id}")
    public ResponseEntity<String> createAnswer(@PathVariable("id") Integer id,
                                               @RequestBody Map<String, String> body, Principal principal) {
        String content = body.get("content");

        // 질문 존재 여부 확인
        Question question = questionService.getQuestion(id);
        if (question == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("질문을 찾을 수 없습니다.");
        }

        SiteUser siteUser = this.userService.getUser(principal.getName());

        // 답변 저장 (AnswerService가 필요)
        answerService.create(question, content, siteUser);

        return ResponseEntity.ok("답변이 성공적으로 저장되었습니다.");
    }
}