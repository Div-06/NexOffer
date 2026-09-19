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
@RequestMapping("/api/last-minute")
public class LastMinuteController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public LastMinuteController(ProfileRepository profileRepository,
                                HistoryRepository historyRepository,
                                LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateLastMinuteGuide(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
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

        String prompt = "Generate a compact, highly scannable Last-Minute Interview Revision Guide for a candidate interviewing for \"" + targetRole + "\" at \"" + targetCompany + "\".\n\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"topTechnicalTopics\": [\"...\"],\n" +
                "  \"mustKnowQuestions\": [{ \"q\": \"...\", \"a\": \"...\" }],\n" +
                "  \"quickChecklist\": [\"...\"],\n" +
                "  \"smartQuestionsToAsk\": [\"...\"]\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("company", targetCompany);
        context.put("role", targetRole);
        if (jobDescription != null) context.put("jobDescription", jobDescription);
        if (resumeText != null) context.put("resumeText", resumeText);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are a Senior Interview Coach delivering a high-yield pre-interview survival sheet.",
                context,
                true,
                "last-minute"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("last-minute", context);

        historyRepository.save(new History(
                user.getId(),
                "Last Minute Guide",
                targetCompany,
                targetRole,
                "Generated pre-interview survival cheat sheet"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
