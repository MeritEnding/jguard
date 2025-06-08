// CustomLogoutFilter.java
package com.agent_Spring.agent_spring.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.io.PrintWriter; // PrintWriter 추가

public class CustomLogoutFilter extends GenericFilterBean {

    private final JWTUtil jwtUtil;
    private final RefreshRepository refreshRepository;

    public CustomLogoutFilter(JWTUtil jwtUtil, RefreshRepository refreshRepository) {

        this.jwtUtil = jwtUtil;
        this.refreshRepository = refreshRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {

        //path and method verify
        String requestUri = request.getRequestURI();
        if (!requestUri.matches("^\\/logout$")) {

            filterChain.doFilter(request, response);
            return;
        }
        String requestMethod = request.getMethod();
        if (!requestMethod.equals("POST")) {

            filterChain.doFilter(request, response);
            return;
        }

        //get refresh token
        String refresh = null;
        Cookie[] cookies = request.getCookies();

        // NullPointerException 방지를 위한 cookies null 체크 추가
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) {
                    refresh = cookie.getValue();
                }
            }
        }

        //refresh null check (기존 코드)
        if (refresh == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            PrintWriter writer = response.getWriter(); // PrintWriter 초기화
            writer.print("refresh token null"); // 클라이언트에게 refresh 토큰이 없음을 알림
            return;
        }

        // --- 추가된 로그 시작 ---
        System.out.println("DEBUG: Received Refresh Token: " + refresh);
        // --- 추가된 로그 끝 ---

        //expired check
        try {
            jwtUtil.isExpired(refresh);
        } catch (ExpiredJwtException e) {

            //response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            PrintWriter writer = response.getWriter(); // PrintWriter 초기화
            writer.print("refresh token expired"); // 클라이언트에게 만료되었음을 알림
            return;
        }

        // 토큰이 refresh인지 확인 (발급시 페이로드에 명시)
        String category = jwtUtil.getCategory(refresh);

        // --- 추가된 로그 시작 ---
        System.out.println("DEBUG: Category extracted from refresh token: " + category);
        // --- 추가된 로그 끝 ---

        // category가 null일 수 있으므로 null 체크 추가
        if (category == null || !category.equals("refresh")) {
            //response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            PrintWriter writer = response.getWriter(); // PrintWriter 초기화
            writer.print("invalid refresh token category");
            // --- 수정된 로그 시작 ---
            System.out.println("ERROR: Invalid refresh token category or category is null. Category: " + category); // 클라이언트에게 잘못된 카테고리임을 알림
            // --- 수정된 로그 끝 ---
            return;
        }

        //DB에 저장되어 있는지 확인
        Boolean isExist = refreshRepository.existsByRefresh(refresh);
        if (!isExist) {

            //response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            PrintWriter writer = response.getWriter(); // PrintWriter 초기화
            writer.print("refresh token not found in DB"); // 클라이언트에게 DB에 없음을 알림
            return;
        }

        //로그아웃 진행
        //Refresh 토큰 DB에서 제거
        refreshRepository.deleteByRefresh(refresh);

        //Refresh 토큰 Cookie 값 0
        Cookie cookie = new Cookie("refresh", null);
        cookie.setMaxAge(0);
        cookie.setPath("/"); // 쿠키 경로 설정 (필요시)
        response.addCookie(cookie);

        response.setStatus(HttpServletResponse.SC_OK);
    }
}