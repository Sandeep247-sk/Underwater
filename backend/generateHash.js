import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node generateHash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(`\nPassword: ${password}`);
console.log(`Hash: ${hash}`);
console.log('\nCopy this hash and replace the "passwordHash" value in src/services/dataStore.js');
