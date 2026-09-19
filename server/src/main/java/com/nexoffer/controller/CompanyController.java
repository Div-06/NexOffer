package com.nexoffer.controller;

import com.nexoffer.model.History;
import com.nexoffer.model.Profile;
import com.nexoffer.model.User;
import com.nexoffer.repository.HistoryRepository;
import com.nexoffer.repository.ProfileRepository;
import com.nexoffer.service.LlmGatewayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public CompanyController(ProfileRepository profileRepository,
                             HistoryRepository historyRepository,
                             LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/research")
    public ResponseEntity<?> researchCompany(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
        String company = body != null ? body.get("company") : null;
        String role = body != null ? body.get("role") : null;

        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            Profile p = profileOpt.get();
            if (company == null || company.isBlank()) company = p.getCompany();
            if (role == null || role.isBlank()) role = p.getRole();
        }

        String targetCompany = (company != null && !company.isBlank()) ? company : "Target Tech Company";
        String targetRole = (role != null && !role.isBlank()) ? role : "Software Engineer";

        String prompt = "Generate structured, professional company interview insights for \"" + targetCompany + "\" for the position of \"" + targetRole + "\".\n" +
                "Structure your research into:\n" +
                "1. companyName\n" +
                "2. overview\n" +
                "3. majorProducts (array)\n" +
                "4. typicalInterviewStages (array of {stage, description})\n" +
                "5. coreTechnicalTopics (array)\n" +
                "6. preparationTips (array)\n\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"companyName\": \"...\",\n" +
                "  \"overview\": \"...\",\n" +
                "  \"majorProducts\": [\"...\"],\n" +
                "  \"typicalInterviewStages\": [{ \"stage\": \"...\", \"description\": \"...\" }],\n" +
                "  \"coreTechnicalTopics\": [\"...\"],\n" +
                "  \"preparationTips\": [\"...\"]\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("company", targetCompany);
        context.put("role", targetRole);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an IT Industry Analyst and Tech Career Researcher.",
                context,
                true,
                "company-research"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("company-research", context);

        historyRepository.save(new History(
                user.getId(),
                "Company Research",
                targetCompany,
                targetRole,
                "Researched interview rounds & tech focus areas"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
