package com.nexoffer.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    private static final List<String> COMMON_TECH_SKILLS = Arrays.asList(
            "JavaScript", "TypeScript", "React", "React.js", "Next.js", "Node.js", "Express", "Express.js",
            "Java", "Spring Boot", "Spring Data JPA", "Hibernate", "PostgreSQL", "MySQL", "SQL", "MongoDB",
            "Python", "Django", "FastAPI", "C++", "C#", ".NET", "Redis", "Kafka", "REST API", "GraphQL",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "Linux",
            "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Redux", "Data Structures", "Algorithms", "OOP",
            "DBMS", "System Design", "Agile", "Scrum", "Unit Testing", "JUnit", "Postman"
    );

    public String parseResumePDF(File pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text != null) {
                text = text.replace("\r\n", "\n").replaceAll("[ \\t]+", " ").trim();
            }
            return text;
        } catch (Exception ex) {
            log.error("Error reading PDF with Apache PDFBox: {}", ex.getMessage());
            throw new IOException("Failed to extract text from PDF: " + ex.getMessage(), ex);
        }
    }

    public List<String> extractBasicKeywords(String text) {
        if (text == null || text.isBlank()) {
            return new ArrayList<>();
        }

        List<String> detected = new ArrayList<>();
        String lowerText = text.toLowerCase();

        for (String skill : COMMON_TECH_SKILLS) {
            String escaped = Pattern.quote(skill.toLowerCase());
            Pattern pattern = Pattern.compile("\\b" + escaped + "\\b", Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(lowerText).find() && !detected.contains(skill)) {
                detected.add(skill);
            }
        }

        return detected;
    }
}
