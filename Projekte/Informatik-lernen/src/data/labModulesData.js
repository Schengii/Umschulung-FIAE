import { ihkModules } from './labModules/ihkModules.js';
import { networkModules } from './labModules/networkModules.js';
import { securityModules } from './labModules/securityModules.js';
import { cloudDevopsModules } from './labModules/cloudDevopsModules.js';
import { softwareDataModules } from './labModules/softwareDataModules.js';
import { LAB_EXAM_DOMAINS } from './labExamDomains.js';

export const LAB_MODULES = [
  ...ihkModules,
  ...networkModules,
  ...securityModules,
  ...cloudDevopsModules,
  ...softwareDataModules
].map((lab) => (LAB_EXAM_DOMAINS[lab.id] ? { ...lab, examDomain: LAB_EXAM_DOMAINS[lab.id] } : lab));
