function generateSecurePassword(length = 8): string {
  if (length < 4) {
    throw new Error('Password length must be at least 4 to meet character requirements');
  }

  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const number = '0123456789';
  const special = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  const filler = lower + number;

  const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const passwordChars = [
    getRandomChar(upper),
    getRandomChar(lower),
    getRandomChar(number),
    getRandomChar(special),
  ];

  while (passwordChars.length < length) {
    passwordChars.push(getRandomChar(filler));
  }

  return passwordChars.sort(() => Math.random() - 0.5).join('');
}

export { generateSecurePassword };
