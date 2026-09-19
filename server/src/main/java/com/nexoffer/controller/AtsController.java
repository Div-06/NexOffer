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
@RequestMapping("/api/resume")
public class AtsController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public AtsController(ProfileRepository profileRepository,
                         HistoryRepository historyRepository,
                         LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/ats")
    public ResponseEntity<?> analyzeAts(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
        String resumeText = body != null ? body.get("resumeText") : null;
        String jobDescription = body != null ? body.get("jobDescription") : null;
        String company = body != null ? body.get("company") : null;
        String role = body != null ? body.get("role") : null;

        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            Profile p = profileOpt.get();
            if (resumeText == null || resumeText.isBlank()) resumeText = p.getResumeText();
            if (jobDescription == null || jobDescription.isBlank()) jobDescription = p.getJobDescription();
            if (company == null || company.isBlank()) company = p.getCompany();
            if (role == null || role.isBlank()) role = p.getRole();
        }

        if (resumeText == null || resumeText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Resume content is required. Please upload your resume first."));
        }

        String prompt = "Perform a thorough Applicant Tracking System (ATS) scan and match analysis comparing the candidate's Resume against the Job Description (for " +
                (role != null ? role : "Target Role") + " at " + (company != null ? company : "Target Company") + ").\n\n" +
                "Provide realistic, accurate, and actionable ATS feedback in valid JSON with this exact schema:\n" +
                "{\n" +
                "  \"atsScore\": <number 0-100>,\n" +
                "  \"keywordMatchPercentage\": <number 0-100>,\n" +
                "  \"matchedSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"missingSkills\": [\"missing1\", \"missing2\"],\n" +
                "  \"strengths\": [\"strength1\", \"strength2\"],\n" +
                "  \"suggestions\": [\"suggestion1\", \"suggestion2\"],\n" +
                "  \"summary\": \"evaluation summary\"\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("resumeText", resumeText);
        context.put("jobDescription", jobDescription != null ? jobDescription : "Standard tech requirements");
        context.put("company", company != null ? company : "Target Company");
        context.put("role", role != null ? role : "Software Engineer");

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an advanced enterprise Applicant Tracking System (ATS) and Senior Technical Recruiter analyzer.",
                context,
                true,
                "ats"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("ats", context);

        // Record history
        historyRepository.save(new History(
                user.getId(),
                "ATS Scanner",
                company != null ? company : "General",
                role != null ? role : "Software Role",
                "ATS Compatibility Scan Completed"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
