// src/main/java/com/agent_Spring/agent_spring/FraudCase/FraudStatsRepository.java
package com.agent_Spring.agent_spring.FraudCase;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FraudStatsRepository extends JpaRepository<FraudStats, Long> {
    // 특정 시도(city)의 모든 통계 데이터를 연도 오름차순으로 조회
    List<FraudStats> findByCityOrderByYearAsc(String city);
}