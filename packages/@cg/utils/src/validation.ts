/**
 * Validation utility functions
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

export function isNumeric(str: string): boolean {
  return /^[0-9]+$/.test(str);
}

export function isHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function isDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

export function isIPv6(ip: string): boolean {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
}

export function isCreditCard(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i] || '0', 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

export function validateEmail(email: string): { valid: boolean; reason?: string } {
  if (!email) return { valid: false, reason: 'Email is required' };
  if (!isValidEmail(email)) return { valid: false, reason: 'Invalid email format' };
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; reason?: string } {
  if (!phone) return { valid: false, reason: 'Phone number is required' };
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return { valid: false, reason: 'Phone number too short' };
  if (cleaned.length > 15) return { valid: false, reason: 'Phone number too long' };
  if (!isPhone(phone)) return { valid: false, reason: 'Invalid phone format' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (!password) return { valid: false, reason: 'Password is required' };
  if (password.length < 8) return { valid: false, reason: 'Password must be at least 8 characters' };
  if (!/[a-z]/.test(password)) return { valid: false, reason: 'Password must contain lowercase letter' };
  if (!/[A-Z]/.test(password)) return { valid: false, reason: 'Password must contain uppercase letter' };
  if (!/\d/.test(password)) return { valid: false, reason: 'Password must contain number' };
  if (!/[@$!%*?&]/.test(password)) return { valid: false, reason: 'Password must contain special character' };
  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; reason?: string } {
  if (!username) return { valid: false, reason: 'Username is required' };
  if (username.length < 3) return { valid: false, reason: 'Username must be at least 3 characters' };
  if (username.length > 20) return { valid: false, reason: 'Username must be less than 20 characters' };
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { valid: false, reason: 'Username can only contain letters, numbers, - and _' };
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function validateRequired<T>(value: T, fieldName: string): { valid: boolean; reason?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, reason: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; reason?: string } {
  if (value.length < min) {
    return { valid: false, reason: `${fieldName} must be at least ${min} characters` };
  }
  if (value.length > max) {
    return { valid: false, reason: `${fieldName} must be less than ${max} characters` };
  }
  return { valid: true };
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; reason?: string } {
  if (value < min) {
    return { valid: false, reason: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { valid: false, reason: `${fieldName} must be less than ${max}` };
  }
  return { valid: true };
}

export function validateEnum<T>(
  value: T,
  validValues: T[],
  fieldName: string
): { valid: boolean; reason?: string } {
  if (!validValues.includes(value)) {
    return { valid: false, reason: `${fieldName} must be one of: ${validValues.join(', ')}` };
  }
  return { valid: true };
}