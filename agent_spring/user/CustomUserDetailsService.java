// CustomUserDetailsService.java

package com.agent_Spring.agent_spring.user;

import com.agent_Spring.agent_spring.CustomUserDetails; // CustomUserDetails 임포트 추가
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // ✅ 수정된 코드
        // username을 기준으로 데이터베이스에서 사용자 정보를 찾습니다.
        SiteUser userData = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 사용자 정보가 존재하면 CustomUserDetails 객체를 생성하여 반환합니다.
        // Spring Security는 이 객체를 사용하여 사용자를 인증합니다.
        return new CustomUserDetails(userData);
    }
}