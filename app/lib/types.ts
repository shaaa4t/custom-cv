export type CvContact = {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

export type CvExperience = {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

export type CvEducation = {
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  details?: string[];
};

export type CvProject = {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
};

export type CvCertification = {
  name: string;
  issuer?: string;
  date?: string;
};

export type CvSkillGroup = {
  category: string;
  items: string[];
};

export type Cv = {
  name: string;
  title?: string;
  contact: CvContact;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  skills: CvSkillGroup[];
  projects?: CvProject[];
  certifications?: CvCertification[];
};
