import bcrypt from "bcrypt";

export async function hashPassword(password) {
  const saltRounds = 14;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function comparePasswords(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
