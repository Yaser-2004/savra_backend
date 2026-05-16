import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pptRoutes from "./routes/pptRoutes.js";

// IMPORTANT:
// importing worker starts the worker process
import "./queue/pptWorker.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// serve generated PPT files
app.use("/outputs", express.static("outputs"));

app.use("/api/ppt", pptRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});