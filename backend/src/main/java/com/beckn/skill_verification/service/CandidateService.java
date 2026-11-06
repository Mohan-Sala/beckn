package com.beckn.skill_verification.service;

import com.beckn.skill_verification.dto.CandidateProfileDto;
import com.beckn.skill_verification.dto.CandidateSkillDto;
import com.beckn.skill_verification.entity.User;
import com.beckn.skill_verification.repository.UserRepository;
import com.beckn.skill_verification.entity.CandidateProfile;
import com.beckn.skill_verification.repository.CandidateProfileRepository;
import com.beckn.skill_verification.entity.CandidateSkill;
import com.beckn.skill_verification.repository.CandidateSkillRepository;
import com.beckn.skill_verification.entity.Skill;
import com.beckn.skill_verification.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SkillRepository skillRepository;

    public CandidateProfileDto getCandidateProfile(Long candidateId) {
        User user = userRepository.findById(candidateId).orElseThrow(() -> new RuntimeException("User not found"));
        CandidateProfile profile = profileRepository.findByUserId(candidateId).orElse(new CandidateProfile());
        
        CandidateProfileDto dto = new CandidateProfileDto();
        dto.setCandidateId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setEducation(profile.getEducation());
        dto.setCollege(profile.getCollege());
        dto.setGraduationYear(profile.getGraduationYear());
        
        List<CandidateSkill> skills = candidateSkillRepository.findByCandidateId(candidateId);
        List<CandidateSkillDto> skillDtos = skills.stream().map(cs -> {
            Skill s = skillRepository.findById(cs.getSkillId()).orElseThrow();
            CandidateSkillDto sdto = new CandidateSkillDto();
            sdto.setSkillId(s.getId());
            sdto.setName(s.getName());
            sdto.setCategory(s.getCategory());
            sdto.setCompetencyLevel(cs.getCompetencyLevel());
            sdto.setVerificationStatus(cs.getVerificationStatus());
            sdto.setConfidenceScore(cs.getConfidenceScore());
            return sdto;
        }).collect(Collectors.toList());
        
        dto.setSkills(skillDtos);
        
        // Calculate overall score based on verified skills
        int totalScore = 0;
        int verifiedCount = 0;
        for (CandidateSkillDto sdto : skillDtos) {
            if ("VERIFIED".equals(sdto.getVerificationStatus()) && sdto.getConfidenceScore() != null) {
                totalScore += sdto.getConfidenceScore();
                verifiedCount++;
            }
        }
        dto.setOverallVerificationScore(verifiedCount > 0 ? Math.min(totalScore / verifiedCount, 95) : 0);
        
        return dto;
    }
}
