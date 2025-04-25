// utils/passwordUtils.js
const bcrypt = require('bcryptjs');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored hash to compare against
 * @returns {Promise<boolean>} - True if password matches
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Create a test script that generates a hashed password and tests verification
 */
const testPasswordHashing = async () => {
  const testPassword = 'TestPassword123!';
  console.log(`Original password: ${testPassword}`);
  
  // Hash the password
  const hashedPassword = await hashPassword(testPassword);
  console.log(`Hashed password: ${hashedPassword}`);
  
  // Verify correct password
  const correctVerification = await verifyPassword(testPassword, hashedPassword);
  console.log(`Correct password verification result: ${correctVerification}`);
  
  // Verify incorrect password
  const wrongVerification = await verifyPassword('WrongPassword', hashedPassword);
  console.log(`Wrong password verification result: ${wrongVerification}`);
  
  return {
    testPassword,
    hashedPassword
  };
};

// Run this script directly to test and generate passwords
if (require.main === module) {
  testPasswordHashing()
    .then(({ testPassword, hashedPassword }) => {
      console.log('\nSQL statement to insert test user:');
      console.log(`INSERT INTO users (username, password_hash, is_admin) VALUES ('testuser', '${hashedPassword}', 0);`);
    })
    .catch(err => console.error('Error in password test:', err));
}

module.exports = {
  hashPassword,
  verifyPassword,
  testPasswordHashing
};