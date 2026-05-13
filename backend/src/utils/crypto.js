const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.ENCRYPTION_KEY || 'dhrs-encryption-key-change-in-production-32b!';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'utf8').slice(0, 32), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'utf8').slice(0, 32), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function hash(text) {
  if (!text) return text;
  return crypto.createHash('sha256').update(text).digest('hex');
}

function maskIdNumber(idNumber) {
  if (!idNumber || idNumber.length < 6) return '****';
  return idNumber.slice(0, 3) + '****' + idNumber.slice(-4);
}

function maskSalary(salary) {
  if (!salary && salary !== 0) return '****';
  const s = String(salary);
  if (s.length <= 4) return '****';
  return s.slice(0, -4).replace(/./g, '*') + s.slice(-4);
}

module.exports = { encrypt, decrypt, hash, maskIdNumber, maskSalary };
