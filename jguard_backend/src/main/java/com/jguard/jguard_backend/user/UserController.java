package com.jguard.jguard_backend.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody UserCreateForm userCreateForm) {
        if (!userCreateForm.getPassword1().equals(userCreateForm.getPassword2())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        userService.create(
                userCreateForm.getUsername(),
                userCreateForm.getEmail(),
                userCreateForm.getPassword1(),
                "ROLE_USER"
        );
        return ResponseEntity.ok("회원가입 성공");
    }
}
