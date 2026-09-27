import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { requireSession } from "../auth";

const uploadDirectory = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_request, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        callback(null, safeName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_request, file, callback) => {
        const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (acceptedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Only JPG, PNG, and WEBP images are allowed."));
        }
    },
});

export const uploadsRouter = Router();

uploadsRouter.use(requireSession);

uploadsRouter.post("/image", upload.single("image"), (request, response) => {
    if (!request.file) {
        return response.status(400).json({
            message: "Please choose an image.",
        });
    }

    return response.status(201).json({
        url: `/uploads/${request.file.filename}`,
        filename: request.file.filename,
    });
});