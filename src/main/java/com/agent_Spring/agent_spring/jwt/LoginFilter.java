// LoginFilter.java
package com.agent_Spring.agent_spring.jwt;

import com.agent_Spring.agent_spring.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException; // IOException 임포트 추가
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import com.fasterxml.jackson.databind.ObjectMapper; // ObjectMapper 임포트 추가
import java.util.Map; // Map 임포트 추가

public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;
    private RefreshRepository refreshRepository;

    // JSON 파싱을 위한 ObjectMapper 추가
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LoginFilter(AuthenticationManager authenticationManager, JWTUtil jwtUtil, RefreshRepository refreshRepository){
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.refreshRepository = refreshRepository;
        // 필터가 처리할 로그인 URL 설정
        setFilterProcessesUrl("/api/user/login"); // <-- 이 경로가 React에서 호출하는 경로와 일치해야 합니다.
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {

        // React에서 JSON 형태로 데이터를 보낸다면, 이를 파싱해야 합니다.
        // obtainUsername(request) 및 obtainPassword(request)는 기본적으로 form-data를 처리합니다.
        // JSON 요청을 처리하려면 다음 코드를 사용합니다.
        try {
            Map<String, String> loginRequest = objectMapper.readValue(request.getInputStream(), Map.class);
            String username = loginRequest.get(getUsernameParameter()); // "username" 파라미터 사용
            String password = loginRequest.get(getPasswordParameter()); // "password" 파라미터 사용

            // 디버깅을 위해 추가: 요청에서 받은 사용자 이름과 비밀번호를 로깅합니다.
            System.out.println("로그인 시도 - 사용자명: " + username + ", 비밀번호: " + password);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);
            return authenticationManager.authenticate(authToken);
        } catch (IOException e) {
            // JSON 파싱 실패 시 예외 처리
            throw new RuntimeException("Failed to parse login request body", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException { // IOException 추가

        String username = authentication.getName();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        String access = jwtUtil.createJwt("access", username, role, 600000L);
        String refresh = jwtUtil.createJwt("refresh", username, role, 86400000L);

        addRefreshEntity(username, refresh, 86400000L);

        response.setHeader("access", access);
        response.addCookie(createCookie("refresh", refresh));
        response.setStatus(HttpStatus.OK.value());

    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException { // IOException 추가
        response.setStatus(401);
        System.out.println("로그인 실패: " + failed.getMessage());

        // React 클라이언트에게 실패 응답을 보냅니다.
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\": \"Login failed\", \"error\": \"" + failed.getMessage() + "\"}");
    }
    private void addRefreshEntity(String username, String refresh, Long expiredMs){

        Date date = new Date(System.currentTimeMillis() + expiredMs);

        RefreshEntity refreshEntity = new RefreshEntity();
        refreshEntity.setUsername(username);
        refreshEntity.setRefresh(refresh);
        refreshEntity.setExpiration(date.toString());

        refreshRepository.save(refreshEntity);
    }

    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24*60*60);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;
    }
}