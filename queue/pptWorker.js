import { Worker } from "bullmq";
import IORedis from "ioredis";

import { generateSlides } from "../services/aiService.js";
import { generatePPT } from "../services/pptService.js";

import {
    generateCacheKey,
    getCachedPPT,
    saveToCache
} from "../services/cacheService.js";
import { prisma } from "../lib/prisma.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: {}, // IMPORTANT FOR UPSTASH
    maxRetriesPerRequest: null
});

const worker = new Worker(
    "ppt-generation",

    async (job) => {

        const { topic, grade, slides } = job.data;

        await prisma.pPTJob.update({
            where: {
                id: job.data.dbId
            },
            data: {
                status: "processing"
            }
        });

        console.log("Processing:", topic);

        // =========================================
        // STEP 1 -> CACHE CHECK
        // =========================================

        const cacheKey = generateCacheKey(
            topic,
            grade,
            slides
        );

        const cachedResult = getCachedPPT(cacheKey);

        if (cachedResult) {

            console.log("Returning cached PPT");

            return {
                success: true,
                cached: true,
                ...cachedResult
            };
        }

        // =========================================
        // STEP 2 -> AI GENERATION
        // =========================================

        await job.updateProgress(10);
        const slideContent = await generateSlides(
            topic,
            grade,
            slides
        );

        // =========================================
        // STEP 3 -> PPT GENERATION
        // =========================================

        await job.updateProgress(50);
        const pptResult = await generatePPT(
            slideContent
        );

        await prisma.pPTJob.update({
            where: {
                id: job.data.dbId
            },
            data: {
                status: "completed",
                pptPath: pptResult.filepath
            }
        });

        // =========================================
        // STEP 4 -> SAVE TO CACHE
        // =========================================

        await job.updateProgress(90);
        saveToCache(
            cacheKey,
            pptResult
        );

        // =========================================
        // RETURN RESULT
        // =========================================

        await job.updateProgress(100);
        return {
            success: true,
            cached: false,
            ...pptResult
        };
    },

    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
    console.log(`Job failed`, err);
    if (job?.data?.dbId) {
        await prisma.pPTJob.update({
            where: {
                id: job.data.dbId
            },
            data: {
                status: "failed"
            }
        });
    }
});