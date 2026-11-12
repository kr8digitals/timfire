import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: npm run make-admin-password -- "your password"  (8+ characters)');
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 12);
// Base64, because Next's .env parser expands the `$` characters inside a raw
// bcrypt hash and silently truncates it. See lib/auth.ts.
console.log('ADMIN_EMAIL=you@example.com');
console.log('ADMIN_PASSWORD_HASH=' + Buffer.from(hash, 'utf8').toString('base64'));
