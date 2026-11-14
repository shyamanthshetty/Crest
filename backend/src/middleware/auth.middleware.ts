import {type Request , type Response , type NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthRequest extends Request {
    user?: {id: string};
}

export const requireAuth = (req: AuthRequest , res:Response ,next : NextFunction) => {
    
    let token = req.cookies?.token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(' ')[1];
        }
    }

    if(!token){
        return res.status(401).json({
            error:"Unauthorized: No Token Received"
        })
    }

try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string)as unknown as  {
        id :string
    }
    req.user =decoded;
    next();
    
}catch (error){
return res.status(401).json({error :"Unauthorized : Invalid TOKEN"});
}
    
}