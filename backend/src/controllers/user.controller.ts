import {type Request , type Response } from "express"
import jwt from "jsonwebtoken";
import {createUser , findUserByEmail , checkPassword, generateResetToken, resetPassword} from "../services/user.service.js"

const generateToken = (user: { id: string; email: string }) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};

export const signup = async (req : Request , res : Response)=> {
    try {
        const {email, password} = req.body;
        if (!email || !password ){
            return res.status(400).json({error : "Invalid Credentials"})
        }

        const user = await createUser(email, password) 
        const token = generateToken(user) 
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600000, // 1 hour
        });

        return res.status(200).json({
            message:"Login Successful", 
            token ,
            user:{id: user.id , email : user.email }
        })
    } catch (error: any) {
       console.error("Signup Error:", error);
       return res.status(400).json({ error: error.message });
    }
}
    export const login = async (req: Request , res: Response) =>{
        try {
            const {email , password} = req.body

            if(!email || !password){
                return res.status(400).json({
                    error: "Email and Password are required"
                });
            }
            //Find the User 
            const user = await findUserByEmail(email);
            if(!user){
                return res.status(401).json({
                    error: "Invalid Credentials"
                })
            }
        
            // Check Password
            
            const isPasswordValid = await checkPassword(password , user.passwordHash);

            if (!isPasswordValid){
                return res.status(401).json({
                    error : "Invalid Credentials"
                })
            }

            //issue the token 
            const token = generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 3600000, // 1 hour
            });
            return res.status(200).json({
                message : "Login Successful",
                token,
                user : {id : user.id , email : user.email}
            })

        } catch(error: any){
            console.error("Login Error:", error);
            return res.status(500).json({
                error: "Internal Server Error"
            })
        }
    }

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const token = await generateResetToken(email);

        // Always return success to prevent email enumeration attacks
        // In production, you would send this token via email instead of returning it
        if (token) {
            console.log(`[DEV] Password reset token for ${email}: ${token}`);
        }

        return res.status(200).json({
            message: "If that email exists, a reset link has been sent.",
            // ⚠️ Remove this in production — only here for dev/testing
            ...(token && { resetToken: token }),
        });
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// ---------- RESET PASSWORD ----------
export const handleResetPassword = async (req: Request, res: Response) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: "Email, token, and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        await resetPassword(email, token, newPassword);

        return res.status(200).json({
            message: "Password has been reset successfully",
        });
    } catch (error: any) {
        console.error("Reset Password Error:", error);

        if (error.message === "Invalid or expired reset token") {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({ error: "Internal Server Error" });
    }
};