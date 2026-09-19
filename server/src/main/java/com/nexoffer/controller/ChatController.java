package com.nexoffer.controller;

import com.nexoffer.model.Profile;
import com.nexoffer.model.User;
import com.nexoffer.repository.ProfileRepository;
import com.nexoffer.service.LlmGatewayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ProfileRepository profileRepository;
    private final LlmGatewayService llmGatewayService;

    public ChatController(ProfileRepository profileRepository, LlmGatewayService llmGatewayService) {
        this.profileRepository = profileRepository;
        this.llmGatewayService = llmGatewayService;
    }

    @PostMapping
    public ResponseEntity<?> handleChat(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> body) {
        String message = body.containsKey("message") ? body.get("message").toString() : null;

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Message cannot be empty."));
        }

        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        String company = profileOpt.map(Profile::getCompany).orElse("Target Company");
        String role = profileOpt.map(Profile::getRole).orElse("Software Engineer");
        String resumeText = profileOpt.map(Profile::getResumeText).orElse("");
        String jobDescription = profileOpt.map(Profile::getJobDescription).orElse("");

        String systemPrompt = "You are the **NexOffer AI Career Assistant**, an intelligent, empathetic, and sharp technical interview mentor.\n" +
                "Target Company: " + company + "\n" +
                "Target Role: " + role + "\n" +
                "Stored Resume Summary: " + (resumeText.isEmpty() ? "Not yet uploaded" : "Available") + "\n" +
                "Stored JD: " + (jobDescription.isEmpty() ? "Not provided yet" : "Available") + "\n\n" +
                "Guidelines:\n" +
                "1. Provide concise, high-value advice and code snippets where requested.\n" +
                "2. Ground all answers in their target role and company.\n" +
                "3. Format cleanly with markdown (bolding, bullet points, code blocks).";

        StringBuilder formattedHistory = new StringBuilder();
        if (body.containsKey("conversationHistory") && body.get("conversationHistory") instanceof List) {
            List<?> history = (List<?>) body.get("conversationHistory");
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                Object item = history.get(i);
                if (item instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) item;
                    String sender = "user".equals(map.get("sender")) ? "Candidate" : "NexOffer Coach";
                    formattedHistory.append(sender).append(": ").append(map.get("text")).append("\n");
                }
            }
        }

        String prompt = (formattedHistory.length() > 0 ? "Recent Conversation:\n" + formattedHistory + "\n\n" : "") + "Candidate Question: " + message;

        Map<String, String> context = new HashMap<>();
        context.put("company", company);
        context.put("role", role);
        if (!resumeText.isEmpty()) context.put("resumeText", resumeText);
        if (!jobDescription.isEmpty()) context.put("jobDescription", jobDescription);

        LlmGatewayService.AiResponse aiResponse = llmGatewayService.generateAIResponse(
                prompt,
                systemPrompt,
                context,
                false,
                "chat"
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "reply", aiResponse.getContent(),
                "provider", aiResponse.getProvider()
        ));
    }
}
