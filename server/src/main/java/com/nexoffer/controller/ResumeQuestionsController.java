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
@RequestMapping("/api/resume-questions")
public class ResumeQuestionsController {

    private final ProfileRepository profileRepository;
    private final HistoryRepository historyRepository;
    private final LlmGatewayService llmGatewayService;

    public ResumeQuestionsController(ProfileRepository profileRepository,
                                    HistoryRepository historyRepository,
                                    LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.historyRepository = historyRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateResumeQuestions(@AuthenticationPrincipal User user, @RequestBody(required = false) Map<String, String> body) {
        String resumeText = body != null ? body.get("resumeText") : null;
        String company = body != null ? body.get("company") : null;
        String role = body != null ? body.get("role") : null;

        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            Profile p = profileOpt.get();
            if (resumeText == null || resumeText.isBlank()) resumeText = p.getResumeText();
            if (company == null || company.isBlank()) company = p.getCompany();
            if (role == null || role.isBlank()) role = p.getRole();
        }

        if (resumeText == null || resumeText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Resume text is missing. Please upload your resume in Profile first."));
        }

        String targetCompany = (company != null && !company.isBlank()) ? company : "Target Company";
        String targetRole = (role != null && !role.isBlank()) ? role : "Software Developer";

        String prompt = "Carefully inspect the candidate's Resume provided in context.\n" +
                "Generate high-impact technical interview questions specifically customized to their resume content in 3 areas:\n" +
                "1. projectQuestions (3-4 questions targeting architecture, trade-offs, security, database)\n" +
                "2. skillQuestions (2-3 deep questions probing language fundamentals and tools)\n" +
                "3. experienceQuestions (2 questions on team collaboration, agile, code review)\n\n" +
                "Return ONLY valid JSON with this schema:\n" +
                "{\n" +
                "  \"projectQuestions\": [{ \"question\": \"...\", \"category\": \"...\", \"difficulty\": \"Easy|Medium|Hard\", \"suggestedAnswer\": \"...\" }],\n" +
                "  \"skillQuestions\": [{ \"question\": \"...\", \"category\": \"...\", \"difficulty\": \"Easy|Medium|Hard\", \"suggestedAnswer\": \"...\" }],\n" +
                "  \"experienceQuestions\": [{ \"question\": \"...\", \"category\": \"...\", \"difficulty\": \"Easy|Medium|Hard\", \"suggestedAnswer\": \"...\" }]\n" +
                "}";

        Map<String, String> context = new HashMap<>();
        context.put("resumeText", resumeText);
        context.put("company", targetCompany);
        context.put("role", targetRole);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                "You are an expert technical interviewer who rigorously analyzes candidate resumes to ask pointed, architecture-level questions.",
                context,
                true,
                "resume-questions"
        );

        Object data = aiResponse.getParsedJson() != null ? aiResponse.getParsedJson() : llmGatewayService.generateFallbackResponse("resume-questions", context);

        historyRepository.save(new History(
                user.getId(),
                "Resume Questions",
                targetCompany,
                targetRole,
                "Generated resume-specific project & skill questions"
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "provider", aiResponse.getProvider()
        ));
    }
}
