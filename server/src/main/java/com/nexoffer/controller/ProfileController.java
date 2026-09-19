package com.nexoffer.controller;

import com.nexoffer.model.Profile;
import com.nexoffer.model.User;
import com.nexoffer.repository.ProfileRepository;
import com.nexoffer.service.ResumeParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final ResumeParserService resumeParserService;

    public ProfileController(ProfileRepository profileRepository, ResumeParserService resumeParserService) {
        this.profileRepository = profileRepository;
        this.resumeParserService = resumeParserService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(new Profile(user.getId())));

        return ResponseEntity.ok(Map.of("success", true, "profile", profile));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> body) {
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> new Profile(user.getId()));

        if (body.containsKey("company")) profile.setCompany(String.valueOf(body.get("company")).trim());
        if (body.containsKey("role")) profile.setRole(String.valueOf(body.get("role")).trim());
        if (body.containsKey("jobDescription")) profile.setJobDescription(String.valueOf(body.get("jobDescription")).trim());
        if (body.containsKey("resumeText")) profile.setResumeText(String.valueOf(body.get("resumeText")));
        if (body.containsKey("experienceYears")) profile.setExperienceYears(String.valueOf(body.get("experienceYears")));

        if (body.containsKey("skills") && body.get("skills") instanceof List) {
            List<?> rawSkills = (List<?>) body.get("skills");
            List<String> stringSkills = new ArrayList<>();
            for (Object s : rawSkills) {
                if (s != null) stringSkills.add(s.toString());
            }
            profile.setSkills(stringSkills);
        }

        profile.setUpdatedAt(LocalDateTime.now());
        Profile saved = profileRepository.save(profile);

        return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully!", "profile", saved));
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResume(@AuthenticationPrincipal User user, @RequestParam("resume") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please select a PDF resume file to upload."));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Only PDF files are supported for resume upload."));
        }

        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String uniqueFilename = System.currentTimeMillis() + "-" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            File destinationFile = uploadDir.resolve(uniqueFilename).toFile();

            try (FileOutputStream fos = new FileOutputStream(destinationFile)) {
                fos.write(file.getBytes());
            }

            String extractedText = resumeParserService.parseResumePDF(destinationFile);
            if (extractedText == null || extractedText.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Could not extract text from this PDF. Please ensure it is not a scanned image."));
            }

            List<String> detectedSkills = resumeParserService.extractBasicKeywords(extractedText);

            Profile profile = profileRepository.findByUserId(user.getId())
                    .orElseGet(() -> new Profile(user.getId()));

            profile.setResumeFileName(uniqueFilename);
            profile.setResumeOriginalName(originalFilename);
            profile.setResumePath(destinationFile.getAbsolutePath());
            profile.setResumeText(extractedText);

            if (detectedSkills != null && !detectedSkills.isEmpty()) {
                Set<String> combined = new LinkedHashSet<>(profile.getSkills() != null ? profile.getSkills() : Collections.emptyList());
                combined.addAll(detectedSkills);
                profile.setSkills(new ArrayList<>(combined));
            }

            profile.setUpdatedAt(LocalDateTime.now());
            Profile saved = profileRepository.save(profile);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume uploaded and processed successfully!");
            response.put("resumeFileName", originalFilename);
            response.put("extractedLength", extractedText.length());
            response.put("detectedSkills", detectedSkills);
            response.put("profile", saved);

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to parse PDF resume: " + ex.getMessage()));
        }
    }

    @DeleteMapping("/resume")
    public ResponseEntity<?> clearResume(@AuthenticationPrincipal User user) {
        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            profile.setResumeFileName("");
            profile.setResumeOriginalName("");
            profile.setResumePath("");
            profile.setResumeText("");
            profile.setUpdatedAt(LocalDateTime.now());
            profileRepository.save(profile);
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Resume cleared from profile."));
    }
}
