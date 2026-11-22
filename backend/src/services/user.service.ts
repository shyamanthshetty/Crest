import prisma from "../db/prisma.js";
import bcrypt from "bcrypt"
import crypto from "crypto";

export const createUser =  async(email :string , rawPassword : string) => {
 const existingUser = await prisma.user.findUnique({where:{email}})

 if (existingUser){
    throw new Error("User already exists")
 }

const passwordHash = await bcrypt.hash(rawPassword,12)

const newUser = await prisma.user.create({data:{email,passwordHash}})
return newUser



}

export const findUserByEmail = async (email : string) => {
    return await prisma.user.findUnique({where : {email}})
}
export const checkPassword = async (rawPassword :string , hash: string) =>{
return await bcrypt.compare(rawPassword , hash)
}

// ---------- Forgot Password ----------
export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Perform a dummy hash to equalize response times and mitigate timing side-channel attacks
    await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    return null;
  }

  // Generate a cryptographically random token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash it before storing (so a DB leak doesn't expose live tokens)
  const hashedToken = await bcrypt.hash(rawToken, 10);

  // Store hashed token + 1 hour expiry
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  return rawToken; // Return the raw token (this is what gets sent to the user)
};

// ---------- Reset Password ----------
export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetToken || !user.resetTokenExpiry) {
    throw new Error("Invalid or expired reset token");
  }

  // Check if token has expired
  if (user.resetTokenExpiry < new Date()) {
    throw new Error("Invalid or expired reset token");
  }

  // Compare the raw token with the stored hash
  const isTokenValid = await bcrypt.compare(token, user.resetToken);
  if (!isTokenValid) {
    throw new Error("Invalid or expired reset token");
  }

  // Hash the new password and clear reset fields
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return true;
};