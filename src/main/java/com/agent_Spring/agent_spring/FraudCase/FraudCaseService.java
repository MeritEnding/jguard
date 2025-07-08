package com.agent_Spring.agent_spring.FraudCase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudCaseService {

    private final FraudCaseRepository fraudCaseRepository;

    public List<FraudCase> getCasesByRegion(String city, String district, String neighborhood){
        return fraudCaseRepository.findByCityAndDistrictAndNeighborhood(city, district, neighborhood);
    }
}
