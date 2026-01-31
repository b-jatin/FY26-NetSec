/**
 * PII Masking Functions
 * CRITICAL: Always mask PII before sending to external APIs
 */

export function maskPII(text: string): string {
  let masked = text;
  
  // Email addresses
  masked = masked.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
  
  // Phone numbers (various formats)
  masked = masked.replace(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g, '[PHONE]');
  masked = masked.replace(/\d{3}[-.]?\d{3}[-.]?\d{4}/g, '[PHONE]');
  
  // SSN (Social Security Number)
  masked = masked.replace(/\d{3}-\d{2}-\d{4}/g, '[SSN]');
  masked = masked.replace(/\d{9}/g, (match) => {
    // Only mask if it looks like an SSN (not a credit card or other number)
    if (match.length === 9) return '[SSN]';
    return match;
  });
  
  // Credit cards (16 digits, with or without separators)
  masked = masked.replace(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, '[CARD]');
  
  // Addresses (street addresses)
  masked = masked.replace(/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd|way|circle|cir|court|ct)/gi, '[ADDRESS]');
  
  // IP addresses
  masked = masked.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  
  // URLs (might contain PII)
  masked = masked.replace(/https?:\/\/[^\s]+/g, '[URL]');
  
  return masked;
}

export function hasPII(text: string): boolean {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
  const ssnRegex = /\d{3}-\d{2}-\d{4}/;
  const cardRegex = /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/;
  
  return emailRegex.test(text) || 
         phoneRegex.test(text) || 
         ssnRegex.test(text) || 
         cardRegex.test(text);
}
