import express from "express";
import { pptQueue } from "../queue/pptQueue.js";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/**
 * POST /api/ppt/generate
 * Creates a PPT generation job
 */
router.post("/generate", async (req, res) => {
    try {
        const { topic, grade, slides } = req.body;

        if (!topic || !grade || !slides) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: topic, grade, slides"
            });
        }

        const dbJob = await prisma.pPTJob.create({
            data: {
                topic,
                grade: Number(grade),
                slides: Number(slides),
                status: "queued"
            }
        });

        const job = await pptQueue.add(
            "ppt-generation-job",
            {
                topic,
                grade,
                slides,

                // IMPORTANT
                dbId: dbJob.id
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000
                },
                removeOnComplete: 50,
                removeOnFail: 50
            }
        );

        return res.json({
            success: true,
            jobId: job.id
        });

    } catch (error) {
        console.error("Error creating job:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create PPT generation job"
        });
    }
});

/**
 * GET /api/ppt/status/:id
 * Returns job status + result if completed
 */
router.get("/status/:id", async (req, res) => {
    try {
        const job = await pptQueue.getJob(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const state = await job.getState();

        // completed job result comes here
        const result = job.returnvalue;

        return res.json({
            success: true,
            jobId: job.id,
            status: state,
            progress: job.progress,
            result: result || null
        });

    } catch (error) {
        console.error("Error fetching job:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch job status"
        });
    }
});

export default router;