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
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public RoadmapController(ProfileRepository profileRepository,
                             HistoryRepository historyRepository,
                             LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateRoadmap(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, Object> body) {
        int days = 7;
        String company = null;
        String role = null;
        String jobDescription = null;
        String resumeText = null;

        if (body != null) {
            if (body.containsKey("days")) {
                try {
                    days = Integer.parseInt(body.get("days").toString());
                } catch (Exception ignored) {}
            }
            if (body.containsKey("company")) company = body.get("company").toString();
            if (body.containsKey("role")) role = body.get("role").toString();
            if (body.containsKey("jobDescription")) jobDescription = body.get("jobDescription").toString();
            if (body.containsKey("resumeText")) resumeText = body.get("resumeText").toString();
        }

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

        String prompt = "Create a realistic, day-by-day interview preparation roadmap for a " + days + "-day timeframe.\n" +
                "Target Role: \"" + targetRole + "\"\n" +
                "Target Company: \"" + targetCompany + "\"\n" +
                "Prioritize any missing skills needed for the role based on the provided Resume and Job Description.\n\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"totalDays\": " + days + ",\n" +
                "  \"targetRole\": \"" + targetRole + "\",\n" +
                "  \"company\": \"" + targetCompany + "\",\n" +
                "  \"schedule\": [\n" +
                "    {\n" +
                "      \"day\": \"Day 1\",\n" +
                "      \"title\": \"...\",\n" +
                "      \"topics\": [\"topic 1\", \"topic 2\"],\n" +
                "      \"deliverable\": \"...\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("company", targetCompany);
        context.put("role", targetRole);
        context.put("days", String.valueOf(days));
        if (jobDescription != null) context.put("jobDescription", jobDescription);
        if (resumeText != null) context.put("resumeText", resumeText);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an Agile Interview Coach creating hyper-focused daily preparation sprints.",
                context,
                true,
                "roadmap"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("roadmap", context);

        historyRepository.save(new History(
                user.getId(),
                "Roadmap Generator",
                targetCompany,
                targetRole,
                "Generated " + days + "-day preparation roadmap"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
