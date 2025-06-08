package com.agent_Spring.agent_spring.question;

import com.agent_Spring.agent_spring.user.SiteUser;
import com.agent_Spring.agent_spring.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RequestMapping("/api")
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;

    @GetMapping("/questions")
    public Page<Question> list(@RequestParam(value="page", defaultValue="0") int page) {
        return questionService.getList(page);
    }

    @GetMapping("/board/detail/{id}")
    public Question detail(@PathVariable("id") Integer id){
        return this.questionService.getQuestion(id);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("question/create")
    public String questionCreate(@RequestBody Map<String, String> body, Principal principal) {
        String subject = body.get("subject");
        String content = body.get("content");
        SiteUser siteUser = this.userService.getUser(principal.getName());

        this.questionService.create(subject, content, siteUser);
        return "질문이 등록되었습니다.";
    }

    @PreAuthorize("isAuthenticated()") // ✅ 로그인된 사용자만 접근 허용
    @PutMapping("/question/modify/{id}") // ✅ POST에서 PUT으로 변경
    public ResponseEntity<String> questionModify( // ✅ ResponseEntity 반환
                                                  @RequestBody Map<String, String> body,
                                                  @PathVariable("id") Integer id,
                                                  Principal principal // ✅ JWT 필터에서 주입된 Principal 객체 사용
    ){
        // Principal이 null인 경우는 JWTFilter에서 처리되겠지만, 방어적 코딩
        if (principal == null) {
            return new ResponseEntity<>("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        Question question = this.questionService.getQuestion(id);

        if (question == null) {
            return new ResponseEntity<>("수정하려는 질문을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        // ✅ 핵심 권한 검증: 게시글 작성자와 현재 로그인된 사용자가 일치하는지 확인
        // principal.getName()은 JWT 토큰의 subject(username)를 가져옵니다.
        if (!question.getAuthor().getUsername().equals(principal.getName())) {
            // 권한이 없는 경우 403 Forbidden 반환
            return new ResponseEntity<>("질문 수정 권한이 없습니다. 작성자만 수정할 수 있습니다.", HttpStatus.FORBIDDEN);
        }

        String subject = body.get("subject");
        String content = body.get("content");

        // 입력 유효성 검사 (선택 사항, 프론트엔드에서도 했지만 백엔드에서도 하는 것이 안전)
        if (subject == null || subject.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            return new ResponseEntity<>("제목과 내용을 모두 입력해야 합니다.", HttpStatus.BAD_REQUEST);
        }

        this.questionService.modify(question, subject, content);
        return new ResponseEntity<>("질문이 성공적으로 수정되었습니다.", HttpStatus.OK); // ✅ 성공 시 200 OK 반환
    }

}
