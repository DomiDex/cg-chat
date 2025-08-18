/**
 * Formatting utility functions
 */

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(
  num: number,
  options: {
    decimals?: number;
    locale?: string;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  } = {}
): string {
  const { decimals = 2, locale = 'en-US', notation = 'standard' } = options;
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation,
  }).format(num);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatPhoneNumber(phone: string, format = 'US'): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'US') {
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  return phone;
}

export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return ssn;
}

export function formatZipCode(zip: string): string {
  const cleaned = zip.replace(/\D/g, '');
  if (cleaned.length === 5) return cleaned;
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return zip;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function truncateMiddle(str: string, maxLength: number, separator = '...'): string {
  if (str.length <= maxLength) return str;
  
  const charsToShow = maxLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  
  return str.substr(0, frontChars) + separator + str.substr(str.length - backChars);
}

export function formatList(items: string[], conjunction = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1] || '';
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0] || 'th';
  return num + suffix;
}

export function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return '∞';
  const ratio = numerator / denominator;
  if (ratio === Math.floor(ratio)) return `${ratio}:1`;
  
  // Find simple ratio
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}:${denominator / divisor}`;
}

export function formatFileSize(size: number): string {
  return formatBytes(size, 2);
}

export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

export function formatName(firstName: string, lastName?: string, format = 'full'): string {
  if (!firstName && !lastName) return '';
  
  switch (format) {
    case 'full':
      return [firstName, lastName].filter(Boolean).join(' ');
    case 'last-first':
      return lastName ? `${lastName}, ${firstName}` : firstName;
    case 'initials':
      return [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase();
    case 'first-initial':
      return firstName + (lastName ? ` ${lastName[0]}.` : '');
    default:
      return [firstName, lastName].filter(Boolean).join(' ');
  }
}

export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): string {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city && address.state) {
    parts.push(`${address.city}, ${address.state}`);
  } else if (address.city || address.state) {
    parts.push(address.city || address.state);
  }
  if (address.zip) parts.push(address.zip);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
}

export function formatCoordinates(lat: number, lng: number, decimals = 6): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(decimals)}°${latDir}, ${Math.abs(lng).toFixed(decimals)}°${lngDir}`;
}