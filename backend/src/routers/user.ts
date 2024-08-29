import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";


const prismaClient = new PrismaClient();
const router = Router();

router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const s3Client = new S3Client({});
    const command = new PutObjectCommand({
        Bucket: "my-bucket",
        Key: "my-key",
    });
    const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    });
});


router.post("/signin", async (req, res) => {
    const hardCodedWalletAddress = "0x82633633Ba5b03212d809D0D97E398128B0849FB";

    // Check if the wallet address is valid
    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: hardCodedWalletAddress
        }
    });

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id
        }, JWT_SECRET);

        res.json({ token: token });
    }
    else {
        const user = await prismaClient.user.create({
            data: {
                address: hardCodedWalletAddress,
            }
        });

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);

        res.json({ token: token });
    }
});

export default router;