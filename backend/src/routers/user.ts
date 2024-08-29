import { PrismaClient } from "@prisma/client";
import { response, Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client } from "@aws-sdk/client-s3";
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createTaskInput } from "../types";

const prismaClient = new PrismaClient();
const router = Router();
const s3Client = new S3Client();
const DEFAULT_TITLE = "Select the best one";


router.post("/task", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedData = createTaskInput.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            error: "Invalid input"
        });
    }

    let response = await prismaClient.$transaction(async tx => {
        const response = await tx.task.create({
            data: {
                title: parsedData.data.title ?? DEFAULT_TITLE,
                amount: "1",
                signature: parsedData.data.signature,
                user_id: userId,
            }
        });

        await tx.option.createMany({
            data: parsedData.data.Options.map(x => ({
                image_url: x.imageUrl,
                task_id: response.id,
            }))
        })

        return response;
    });

    res.json({
        id: response.id,
        "success": "Task created successfully"
    });
});


router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: "my-bucket",
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024],
        ],
        Fields: {
            "Content-Type": "image/jpeg",
        },
        Expires: 3600,
    });

    res.json({
        presignedUrl: url,
        fields: fields
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