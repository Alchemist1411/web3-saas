import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from ".";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";


    try{
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        // @ts-ignore
        if(decoded.userId){
            req.userId = decoded.userId;
            return next();
        }
        else{
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

    }
    catch (e) {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }

  
}