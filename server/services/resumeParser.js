const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a PDF file
 * @param {string} filePath - Absolute path to the PDF file on disk
 * @returns {Promise<string>} - Extracted text
 */
const parseResumePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Clean up excessive whitespace and normalize line breaks
    let text = pdfData.text || '';
    text = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
    
    return text;
  } catch (error) {
    console.error(`Error parsing PDF at ${filePath}:`, error.message);
    throw new Error(`Failed to parse resume PDF: ${error.message}`);
  }
};

/**
 * Extracts basic skills and keywords from resume text heuristically
 * @param {string} text 
 * @returns {string[]}
 */
const extractBasicKeywords = (text) => {
  const commonTechSkills = [
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js', 'Node.js', 'Express', 'Express.js',
    'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQL', 'Redis', 'Firebase', 'GraphQL', 'REST API',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD', 'Linux',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Kafka', 'Microservices',
    'Machine Learning', 'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems',
    'Agile', 'Scrum', 'Jira', 'Unit Testing', 'Jest', 'Mocha', 'Postman'
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  for (const skill of commonTechSkills) {
    const escaped = skill.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText) && !foundSkills.includes(skill)) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
};

module.exports = {
  parseResumePDF,
  extractBasicKeywords,
};
