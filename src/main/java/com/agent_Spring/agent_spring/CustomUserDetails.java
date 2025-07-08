package com.agent_Spring.agent_spring.user;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;


public class CustomUserDetails implements UserDetails {

    private final SiteUser userEntity;

    public CustomUserDetails(SiteUser userEntity){
        this.userEntity = userEntity;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();

        collection.add(new SimpleGrantedAuthority("ROLE_" + userEntity.getRole()));

        return collection;
    }

    @Override
    public String getPassword() {
        // SiteUser 엔티티의 실제 비밀번호를 반환해야 합니다.
        return userEntity.getPassword();
    }

    @Override
    public String getUsername() {
        // 사용자 인증 시 사용될 식별자 (여기서는 username)를 반환합니다.
        return userEntity.getUsername();
    }

    @Override
    public boolean isAccountNonExpired(){
        return true; // 계정 만료 여부 (true = 만료되지 않음)
    }

    @Override
    public boolean isAccountNonLocked(){
        return true; // 계정 잠금 여부 (true = 잠기지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired(){
        return true; // 자격 증명(비밀번호) 만료 여부 (true = 만료되지 않음)
    }

    @Override
    public boolean isEnabled(){
        return true; // 계정 활성화 여부 (true = 활성화됨)
    }
}