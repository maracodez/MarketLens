import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import researchRoutes from "./routes/research.routes.js";
import discoveryRoutes from "./routes/discovery.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// Security headers
app.use(helmet());

// Allow frontend requests
app.use(cors());

// Allow JSON request bodies
app.use(express.json());

// Limit excessive requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
});

app.use(limiter);
app.use("/api/research", researchRoutes);
app.use("/api/research", discoveryRoutes);
app.use("/api/ai", aiRoutes);


// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MarketLens AI API is running!"
    });
});

export default app;