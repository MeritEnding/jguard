package com.jguard.jguard_backend.fraudcase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudCaseService {

    private final FraudCaseRepository fraudCaseRepository;

    /** 시도는 필수, 시군구·동은 선택 — 좁힌 만큼만 조건에 반영한다. */
    public List<FraudCase> getCasesByRegion(String city, String district, String neighborhood) {
        if (StringUtils.hasText(district) && StringUtils.hasText(neighborhood)) {
            return fraudCaseRepository.findByCityAndDistrictAndNeighborhood(city, district, neighborhood);
        }
        if (StringUtils.hasText(district)) {
            return fraudCaseRepository.findByCityAndDistrict(city, district);
        }
        return fraudCaseRepository.findByCity(city);
    }
}
