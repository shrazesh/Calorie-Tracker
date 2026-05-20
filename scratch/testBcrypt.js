import bcrypt from 'bcryptjs';

async function testBcrypt() {
  const password = "password123";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("Hash:", hash);
  
  const isMatch = await bcrypt.compare(password, hash);
  console.log("Match:", isMatch);
  
  const isMatchWrong = await bcrypt.compare("wrong", hash);
  console.log("Match Wrong:", isMatchWrong);
}

testBcrypt();
