package com.jguard.jguard_backend.question;

import com.jguard.jguard_backend.user.SiteUser;
import com.jguard.jguard_backend.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RequestMapping("/api")
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;

    @GetMapping("/questions")
    public Page<Question> list(@RequestParam(value = "page", defaultValue = "0") int page) {
        return questionService.getList(page);
    }

    @GetMapping("/board/detail/{id}")
    public Question detail(@PathVariable("id") Integer id) {
        return questionService.getQuestion(id);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/question/create")
    public ResponseEntity<String> questionCreate(@Valid @RequestBody QuestionForm questionForm,
                                                 Principal principal) {
        SiteUser siteUser = userService.getUser(principal.getName());
        questionService.create(questionForm.getSubject(), questionForm.getContent(), siteUser);
        return ResponseEntity.ok("질문이 등록되었습니다.");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/question/modify/{id}")
    public ResponseEntity<String> questionModify(@Valid @RequestBody QuestionForm questionForm,
                                                 @PathVariable("id") Integer id,
                                                 Principal principal) {
        Question question = questionService.getQuestion(id);
        validateAuthor(question, principal, "질문 수정 권한이 없습니다. 작성자만 수정할 수 있습니다.");

        questionService.modify(question, questionForm.getSubject(), questionForm.getContent());
        return ResponseEntity.ok("질문이 성공적으로 수정되었습니다.");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/question/delete/{id}")
    public ResponseEntity<String> questionDelete(Principal principal,
                                                 @PathVariable("id") Integer id) {
        Question question = questionService.getQuestion(id);
        validateAuthor(question, principal, "질문 삭제 권한이 없습니다. 작성자만 삭제할 수 있습니다.");

        questionService.delete(question);
        return ResponseEntity.ok("질문이 성공적으로 삭제되었습니다.");
    }

    private void validateAuthor(Question question, Principal principal, String message) {
        if (!question.getAuthor().getUsername().equals(principal.getName())) {
            throw new AccessDeniedException(message);
        }
    }
}
