package com.jguard.jguard_backend.risk;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegionMarketStatRepository extends JpaRepository<RegionMarketStat, Long> {

    Optional<RegionMarketStat> findBySido(String sido);
}
