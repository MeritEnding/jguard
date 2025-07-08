package com.agent_Spring.agent_spring.news;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface NewsRepository extends JpaRepository<News, Long> {
    boolean existsByTitle(String title);
    List<News> findTop20ByOrderByPublishedAtDesc();
}