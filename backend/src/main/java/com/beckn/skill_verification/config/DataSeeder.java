package com.beckn.skill_verification.config;

import com.beckn.skill_verification.entity.User;
import com.beckn.skill_verification.repository.UserRepository;
import com.beckn.skill_verification.entity.CandidateProfile;
import com.beckn.skill_verification.repository.CandidateProfileRepository;
import com.beckn.skill_verification.entity.CandidateSkill;
import com.beckn.skill_verification.repository.CandidateSkillRepository;
import com.beckn.skill_verification.repository.CredentialRepository;
import com.beckn.skill_verification.entity.Skill;
import com.beckn.skill_verification.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        // Seed Users
        User candidate = new User();
        candidate.setName("Rahul Kumar");
        candidate.setEmail("candidate@test.com");
        candidate.setPassword(passwordEncoder.encode("password"));
        candidate.setRole("CANDIDATE");
        candidate = userRepository.save(candidate);

        User employer = new User();
        employer.setName("Demo Employer");
        employer.setEmail("employer@test.com");
        employer.setPassword(passwordEncoder.encode("password"));
        employer.setRole("EMPLOYER");
        userRepository.save(employer);

        // Seed Candidate Profile
        CandidateProfile profile = new CandidateProfile();
        profile.setUserId(candidate.getId());
        profile.setPhone("1234567890");
        profile.setEducation("B.Tech CSE");
        profile.setCollege("ANITS");
        profile.setGraduationYear(2027);
        profileRepository.save(profile);

        // Seed Skills
        Skill java = new Skill(); java.setName("Java"); java.setCategory("Programming");
        Skill spring = new Skill(); spring.setName("Spring Boot"); spring.setCategory("Backend Development");
        Skill sql = new Skill(); sql.setName("SQL"); sql.setCategory("Database");
        Skill react = new Skill(); react.setName("React"); react.setCategory("Frontend Development");
        
        skillRepository.saveAll(List.of(java, spring, sql, react));

        // Assign Skills to Candidate
        CandidateSkill cs1 = new CandidateSkill(); cs1.setCandidateId(candidate.getId()); cs1.setSkillId(java.getId()); cs1.setVerificationStatus("PENDING");
        CandidateSkill cs2 = new CandidateSkill(); cs2.setCandidateId(candidate.getId()); cs2.setSkillId(spring.getId()); cs2.setVerificationStatus("PENDING");
        CandidateSkill cs3 = new CandidateSkill(); cs3.setCandidateId(candidate.getId()); cs3.setSkillId(sql.getId()); cs3.setVerificationStatus("PENDING");
        CandidateSkill cs4 = new CandidateSkill(); cs4.setCandidateId(candidate.getId()); cs4.setSkillId(react.getId()); cs4.setVerificationStatus("PENDING");
        
        candidateSkillRepository.saveAll(List.of(cs1, cs2, cs3, cs4));
        
        System.out.println("Mock data seeded successfully.");
    }
}
