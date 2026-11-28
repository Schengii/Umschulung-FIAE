import { ihkModules } from './labModules/ihkModules.js';
import { networkModules } from './labModules/networkModules.js';
import { securityModules } from './labModules/securityModules.js';
import { cloudDevopsModules } from './labModules/cloudDevopsModules.js';
import { softwareDataModules } from './labModules/softwareDataModules.js';
import { LAB_EXAM_DOMAINS } from './labExamDomains.js';

const MODULE_FILES = [ihkModules, networkModules, securityModules, cloudDevopsModules, softwareDataModules];

/** Wie viele Labs je Themendatei (neue stehen am Listenanfang) das „Neu“-Abzeichen tragen dürfen. */
export const FRESH_LABS_PER_FILE = 3;

const isNewBadge = (badge) => /\bneu\b/i.test(badge || '');

// „Neu“ ist nur dann eine Information, wenn nicht fast jede Karte es trägt:
// nur die jüngsten Labs jeder Themendatei behalten das Abzeichen.
const FRESH_IDS = new Set(
  MODULE_FILES.flatMap((list) => list.filter((lab) => isNewBadge(lab.badge)).slice(0, FRESH_LABS_PER_FILE).map((lab) => lab.id))
);

export const LAB_MODULES = MODULE_FILES.flat()
  .map((lab) => {
    const { badge, ...rest } = lab;
    return isNewBadge(badge) && !FRESH_IDS.has(lab.id) ? rest : lab;
  })
  .map((lab) => (LAB_EXAM_DOMAINS[lab.id] ? { ...lab, examDomain: LAB_EXAM_DOMAINS[lab.id] } : lab));
