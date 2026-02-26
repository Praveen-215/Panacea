/**
 * Panacea — Shared Type Definitions
 * These serve as documentation and can be used with JSDoc for type checking.
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {string} name
 * @property {number} age
 * @property {string} bloodGroup - e.g., "A+", "O-", "B+", "AB-"
 * @property {string} phone
 * @property {string} emergencyContact
 * @property {string} emergencyContactName
 * @property {string[]} medicalConditions
 * @property {boolean} notificationsEnabled
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Medication
 * @property {string} _id
 * @property {string} userId
 * @property {string} name
 * @property {string} dosage - e.g., "500mg", "10ml"
 * @property {string[]} timings - e.g., ["08:00", "14:00", "20:00"]
 * @property {number} totalStock
 * @property {number} remainingStock
 * @property {string} instructions - e.g., "Take after food"
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} DoseRecord
 * @property {string} _id
 * @property {string} medicationId
 * @property {string} userId
 * @property {string} scheduledTime - ISO date string
 * @property {string|null} takenTime - ISO date string or null
 * @property {'taken'|'missed'|'upcoming'|'skipped'} status
 * @property {string} date - YYYY-MM-DD format
 */

/**
 * @typedef {Object} MedDocument
 * @property {string} _id
 * @property {string} userId
 * @property {string} name
 * @property {string} category - "xray" | "ctscan" | "mri" | "prescription" | "labreport"
 * @property {string} fileName
 * @property {string} fileType
 * @property {number} fileSize
 * @property {string} uploadDate
 * @property {string} url
 */

/**
 * @typedef {Object} EmergencyInfo
 * @property {string} contactName
 * @property {string} contactPhone
 * @property {string} userName
 * @property {number} userAge
 * @property {string} bloodGroup
 * @property {string[]} medicalConditions
 */

/** Document category labels */
const DOCUMENT_CATEGORIES = {
  xray: 'X-Rays',
  ctscan: 'CT Scans',
  mri: 'MRI',
  prescription: 'Doctor Prescriptions',
  labreport: 'Lab Reports',
};

/** Blood group options */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Dose status options */
const DOSE_STATUS = {
  TAKEN: 'taken',
  MISSED: 'missed',
  UPCOMING: 'upcoming',
  SKIPPED: 'skipped',
};

module.exports = {
  DOCUMENT_CATEGORIES,
  BLOOD_GROUPS,
  DOSE_STATUS,
};
