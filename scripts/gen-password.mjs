import crypto from 'node:crypto';

function generatePassword(length = 18) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()_+=-';
  const all = upper + lower + digits + symbols;

  // Đảm bảo có ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
  const required = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  const remaining = Array.from({ length: length - required.length }, () =>
    all[crypto.randomInt(all.length)]
  );

  return [...required, ...remaining]
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

console.log('Generated Passwords:');
console.log('16 ký tự:', generatePassword(16));
console.log('20 ký tự:', generatePassword(20));
console.log('24 ký tự:', generatePassword(24));
