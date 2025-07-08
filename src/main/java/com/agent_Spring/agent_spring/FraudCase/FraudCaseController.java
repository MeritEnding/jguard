package com.agent_Spring.agent_spring.FraudCase;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
@CrossOrigin(origins= "http://localhost:3000")
public class FraudCaseController {

    private final FraudCaseService fraudCaseService;

    @GetMapping("/region")
    public List<FraudCase> getCasesByRegion(
            @RequestParam String city,
            @RequestParam String district,
            @RequestParam String neighborhood
    ){
        return fraudCaseService.getCasesByRegion(city, district, neighborhood);
    }
}
