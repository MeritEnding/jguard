package com.jguard.jguard_backend.fraudcase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FraudRegionStatRepository extends JpaRepository<FraudRegionStat, Long> {

    Optional<FraudRegionStat> findBySido(String sido);
}
