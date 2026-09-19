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
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public SkillGapController(ProfileRepository profileRepository,
                              HistoryRepository historyRepository,
                              LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSkillGap(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
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
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Resume text is missing. Please upload your resume in Profile first."));
        }

        String targetCompany = (company != null && !company.isBlank()) ? company : "Target Company";
        String targetRole = (role != null && !role.isBlank()) ? role : "Target Role";

        String prompt = "Compare the candidate's Resume against the target Job Description (for " + targetRole + " at " + targetCompany + ").\n" +
                "Conduct a comprehensive Skill Gap Analysis.\n" +
                "Classify skills into existingSkills, missingSkills (with priority: High|Medium|Low, reason, recommendedAction), and preparationSummary.\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"existingSkills\": [{ \"skill\": \"...\", \"proficiency\": \"...\", \"notes\": \"...\" }],\n" +
                "  \"missingSkills\": [{ \"skill\": \"...\", \"priority\": \"High|Medium|Low\", \"reason\": \"...\", \"recommendedAction\": \"...\" }],\n" +
                "  \"preparationSummary\": \"...\"\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("resumeText", resumeText);
        context.put("jobDescription", jobDescription != null ? jobDescription : "Standard tech requirements");
        context.put("company", targetCompany);
        context.put("role", targetRole);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an expert Technical Skills Assessor and Career Transition Coach.",
                context,
                true,
                "skill-gap"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("skill-gap", context);

        historyRepository.save(new History(
                user.getId(),
                "Skill Gap Analyzer",
                targetCompany,
                targetRole,
                "Identified skill gaps against target JD"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
