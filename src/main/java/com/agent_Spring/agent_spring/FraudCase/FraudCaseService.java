// src/main/java/com/agent_Spring/agent_spring/FraudCase/FraudStatsService.java
package com.agent_Spring.agent_spring.FraudCase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudStatsService {

    private final FraudStatsRepository fraudStatsRepository;

    public List<FraudStats> getChungcheongbukdoStats() {
        return fraudStatsRepository.findByCityOrderByYearAsc("충청북도");
    }
}