import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role, profileData = {}) => api.post('/auth/register', { name, email, password, role, ...profileData }),
};

export const candidateService = {
  getProfile: (id) => api.get(`/candidates/${id}`),
  addCredential: (id, formData) => api.post(`/candidates/${id}/credentials`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCredentials: (id) => api.get(`/candidates/${id}/credentials`),
  getCredentialForSkill: (id, skillId) => api.get(`/candidates/${id}/credentials/${skillId}`),
  verifyExternalBadge: (id) => api.get(`/candidates/verify-external-badge?id=${id}`),
  verifyResumeFile: (formData) => api.post('/candidates/verify-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyResumeText: (text) => api.post('/candidates/verify-resume-text', { text }),
  verifyCertificateQr: (formData) => api.post('/candidates/verify-certificate-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyQrPayload: (payload) => api.post('/candidates/verify-qr-payload', { payload })
};

export const verificationService = {
  giveConsent: (candidateId, skillId) => api.post(`/verification/${candidateId}/${skillId}/consent`, { consent: true }),
  verifySkill: (candidateId, skillId) => api.post(`/verification/${candidateId}/${skillId}`),
  getResult: (candidateId, skillId) => api.get(`/verification/${candidateId}/${skillId}/result`),
};

export const employerService = {
  searchCandidates: (name) => api.get(`/employer/candidates/search?name=${name}`),
};
