/**
 * Shared validation helpers for request body validation.
 * Uses simple runtime checks — can be upgraded to Zod schemas later.
 */

export function validateRequired(fields, body) {
  const missing = [];
  for (const field of fields) {
    if (!body[field] && body[field] !== 0 && body[field] !== false) {
      missing.push(field);
    }
  }
  return missing;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
