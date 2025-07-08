package com.agent_Spring.agent_spring.FraudCase;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fraud_case")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String city;
    private String district;
    private String neighborhood;

    private String address;
    private String date;
    private int victimCount;

    private String articleUrl;
    private String fraudType;
}
