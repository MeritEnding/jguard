package com.jguard.jguard_backend.fraudcase;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FraudCaseRepository extends JpaRepository<FraudCase, Long> {

    List<FraudCase> findByCityAndDistrictAndNeighborhood(String city, String district, String neighborhood);

    List<FraudCase> findByCityAndDistrict(String city, String district);

    List<FraudCase> findByCity(String city);

    long countByCity(String city);
}
