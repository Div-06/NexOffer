package com.nexoffer.controller;

import com.nexoffer.model.Profile;
import com.nexoffer.model.User;
import com.nexoffer.repository.ProfileRepository;
import com.nexoffer.repository.UserRepository;
import com.nexoffer.security.JwtTokenProvider;
import com.nexoffer.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          ProfileRepository profileRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");

        if (name == null || email == null || password == null || name.isBlank() || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide name, email, and password."));
        }

        if (confirmPassword != null && !password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Passwords do not match."));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Password must be at least 6 characters long."));
        }

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "An account with this email already exists. Please log in."));
            } else {
                existingUser.setName(name.trim());
                existingUser.setPasswordHash(passwordEncoder.encode(password));
                String otp = emailService.generateOTP();
                existingUser.setOtp(otp);
                existingUser.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
                userRepository.save(existingUser);

                EmailService.EmailResult emailResult = emailService.sendOTPEmail(existingUser.getEmail(), otp, "verification");

                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("message", "Account was pending verification. A fresh OTP has been sent to your email.");
                resp.put("email", existingUser.getEmail());
                if (emailResult.getDevOtp() != null) {
                    resp.put("devOtp", emailResult.getDevOtp());
                }
                return ResponseEntity.ok(resp);
            }
        }

        User user = new User(name.trim(), email.trim().toLowerCase(), passwordEncoder.encode(password));
        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        User savedUser = userRepository.save(user);

        // Create initial linked Profile
        Profile profile = new Profile(savedUser.getId());
        profileRepository.save(profile);

        EmailService.EmailResult emailResult = emailService.sendOTPEmail(savedUser.getEmail(), otp, "verification");

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Registration successful! Please verify the OTP sent to your email.");
        resp.put("email", savedUser.getEmail());
        if (emailResult.getDevOtp() != null) {
            resp.put("devOtp", emailResult.getDevOtp());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null || email.isBlank() || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide both email and OTP code."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found with this email address."));
        }

        User user = userOpt.get();

        if (user.isVerified()) {
            String token = tokenProvider.generateToken(user.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Account is already verified. Logging you in.",
                    "token", token,
                    "user", buildUserDto(user)
            ));
        }

        if (user.getOtp() == null || !user.getOtp().trim().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP code. Please check and try again."));
        }

        if (user.getOtpExpiresAt() != null && LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP has expired. Please request a new OTP."));
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Account verified successfully!",
                "token", token,
                "user", buildUserDto(user)
        ));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "No account found with this email."));
        }

        User user = userOpt.get();
        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        EmailService.EmailResult emailResult = emailService.sendOTPEmail(user.getEmail(), otp, "verification");

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "A new OTP has been sent to your email address.");
        if (emailResult.getDevOtp() != null) {
            resp.put("devOtp", emailResult.getDevOtp());
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide both email and password."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid email or password."));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid email or password."));
        }

        if (!user.isVerified()) {
            String otp = emailService.generateOTP();
            user.setOtp(otp);
            user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);

            EmailService.EmailResult emailResult = emailService.sendOTPEmail(user.getEmail(), otp, "verification");

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("isUnverified", true);
            resp.put("email", user.getEmail());
            resp.put("message", "Account not verified. An OTP has been sent to your email.");
            if (emailResult.getDevOtp() != null) {
                resp.put("devOtp", emailResult.getDevOtp());
            }

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
        }

        String token = tokenProvider.generateToken(user.getId());
        Optional<Profile> profileOpt = profileRepository.findByUserId(user.getId());

        Map<String, Object> profileSummary = new HashMap<>();
        if (profileOpt.isPresent()) {
            Profile p = profileOpt.get();
            profileSummary.put("company", p.getCompany());
            profileSummary.put("role", p.getRole());
            profileSummary.put("hasResume", p.getResumeText() != null && !p.getResumeText().isBlank());
            profileSummary.put("hasJd", p.getJobDescription() != null && !p.getJobDescription().isBlank());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful!",
                "token", token,
                "user", buildUserDto(user),
                "profile", profileSummary
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please enter your email address."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "If an account exists with this email, a reset OTP has been sent."));
        }

        User user = userOpt.get();
        String otp = emailService.generateOTP();
        user.setResetPasswordToken(otp);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        EmailService.EmailResult emailResult = emailService.sendOTPEmail(user.getEmail(), otp, "password_reset");

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Password reset OTP sent to your email.");
        resp.put("email", user.getEmail());
        if (emailResult.getDevOtp() != null) {
            resp.put("devOtp", emailResult.getDevOtp());
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (email == null || otp == null || newPassword == null || email.isBlank() || otp.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please provide email, OTP, and new password."));
        }

        if (confirmPassword != null && !newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Passwords do not match."));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Password must be at least 6 characters long."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Invalid request or user not found."));
        }

        User user = userOpt.get();
        if (user.getResetPasswordToken() == null || !user.getResetPasswordToken().trim().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or incorrect reset OTP."));
        }

        if (user.getResetPasswordExpiresAt() != null && LocalDateTime.now().isAfter(user.getResetPasswordExpiresAt())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Reset OTP has expired. Please request a new one."));
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        user.setVerified(true);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully! You are now logged in.",
                "token", token,
                "user", buildUserDto(user)
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Not authenticated"));
        }
        return ResponseEntity.ok(Map.of("success", true, "user", buildUserDto(user)));
    }

    private Map<String, Object> buildUserDto(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("isVerified", user.isVerified());
        return map;
    }
}
