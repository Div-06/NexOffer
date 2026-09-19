package com.nexoffer.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.Random;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public EmailResult sendOTPEmail(String email, String otp, String purpose) {
        String subject = "password_reset".equalsIgnoreCase(purpose)
                ? "NexOffer — Password Reset OTP"
                : "NexOffer — Email Verification OTP";

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject(subject);
                helper.setFrom("NexOffer <noreply@nexoffer.com>");
                helper.setText(buildHtmlTemplate(otp, purpose), true);

                mailSender.send(message);
                log.info("📧 OTP email successfully sent to {}", email);
                return new EmailResult(true, "smtp", null);
            } catch (Exception ex) {
                log.warn("⚠️ SMTP delivery failed ({}). Falling back to dev console output.", ex.getMessage());
            }
        }

        // Dev / Demo Mode Console Output
        log.info("----------------------------------------------------");
        log.info("🔑 [NEXOFFER DEV OTP] Email: {}", email);
        log.info("🔑 [NEXOFFER DEV OTP] OTP Code: {}", otp);
        log.info("🔑 [NEXOFFER DEV OTP] Purpose: {}", purpose);
        log.info("----------------------------------------------------");

        return new EmailResult(true, "dev_console", otp);
    }

    private String buildHtmlTemplate(String otp, String purpose) {
        String actionText = "password_reset".equalsIgnoreCase(purpose) ? "password reset" : "account verification";
        return "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;\">" +
                "<div style=\"text-align: center; margin-bottom: 20px;\">" +
                "<h1 style=\"color: #4f46e5; margin: 0; font-size: 24px;\">NexOffer</h1>" +
                "<p style=\"color: #64748b; font-size: 13px; margin-top: 4px;\">Your Next Offer Starts Here.</p>" +
                "</div>" +
                "<p style=\"color: #334155; font-size: 15px;\">Hello,</p>" +
                "<p style=\"color: #334155; font-size: 15px;\">Use the following One-Time Password (OTP) to complete your " + actionText + ":</p>" +
                "<div style=\"text-align: center; margin: 24px 0;\">" +
                "<span style=\"display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #cbd5e1;\">" + otp + "</span>" +
                "</div>" +
                "<p style=\"color: #64748b; font-size: 13px;\">This OTP is valid for <strong>10 minutes</strong>.</p>" +
                "</div>";
    }

    public static class EmailResult {
        private final boolean sent;
        private final String mode;
        private final String devOtp;

        public EmailResult(boolean sent, String mode, String devOtp) {
            this.sent = sent;
            this.mode = mode;
            this.devOtp = devOtp;
        }

        public boolean isSent() {
            return sent;
        }

        public String getMode() {
            return mode;
        }

        public String getDevOtp() {
            return devOtp;
        }
    }
}
