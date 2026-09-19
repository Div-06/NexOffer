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
@RequestMapping("/api/fast-track")
public class FastTrackController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public FastTrackController(ProfileRepository profileRepository,
                               HistoryRepository historyRepository,
                               LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateFastTrack(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
        String timeframe = body != null && body.containsKey("timeframe") ? body.get("timeframe") : "3 Hours";
        String company = body != null ? body.get("company") : null;
        String role = body != null ? body.get("role") : null;
        String jobDescription = body != null ? body.get("jobDescription") : null;
        String resumeText = body != null ? body.get("resumeText") : null;

        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            Profile p = profileOpt.get();
            if (company == null || company.isBlank()) company = p.getCompany();
            if (role == null || role.isBlank()) role = p.getRole();
            if (jobDescription == null || jobDescription.isBlank()) jobDescription = p.getJobDescription();
            if (resumeText == null || resumeText.isBlank()) resumeText = p.getResumeText();
        }

        String targetCompany = (company != null && !company.isBlank()) ? company : "Target Company";
        String targetRole = (role != null && !role.isBlank()) ? role : "Software Engineer";

        String prompt = "Create a high-impact, prioritized Fast Track interview prep guide for a candidate with ONLY " + timeframe + " remaining before their interview for " + targetRole + " at " + targetCompany + ".\n\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"timeframe\": \"" + timeframe + "\",\n" +
                "  \"urgentChecklist\": [\n" +
                "    {\n" +
                "      \"priority\": 1,\n" +
                "      \"title\": \"...\",\n" +
                "      \"details\": \"...\",\n" +
                "      \"estTime\": \"...\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("company", targetCompany);
        context.put("role", targetRole);
        context.put("timeframe", timeframe);
        if (jobDescription != null) context.put("jobDescription", jobDescription);
        if (resumeText != null) context.put("resumeText", resumeText);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an Emergency Interview Prep Specialist focusing on hyper-efficient revision.",
                context,
                true,
                "fast-track"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("fast-track", context);

        historyRepository.save(new History(
                user.getId(),
                "Fast Track Prep",
                targetCompany,
                targetRole,
                "Generated " + timeframe + " emergency preparation guide"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
