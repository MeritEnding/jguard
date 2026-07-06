package com.jguard.jguard_backend.answer;

import com.jguard.jguard_backend.question.Question;
import com.jguard.jguard_backend.question.QuestionService;
import com.jguard.jguard_backend.user.SiteUser;
import com.jguard.jguard_backend.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/answer")
@CrossOrigin(origins = "http://localhost:3000")
public class AnswerController {

    private final QuestionService questionService;
    private final AnswerService answerService;
    private final UserService userService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create/{id}")
    public ResponseEntity<String> createAnswer(@PathVariable("id") Integer id,
                                               @Valid @RequestBody AnswerForm answerForm,
                                               Principal principal) {
        Question question = questionService.getQuestion(id);
        SiteUser siteUser = userService.getUser(principal.getName());

        answerService.create(question, answerForm.getContent(), siteUser);
        return ResponseEntity.ok("답변이 성공적으로 저장되었습니다.");
    }
}
