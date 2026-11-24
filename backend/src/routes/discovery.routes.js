import express from "express";
import { runDiscovery } from "../controllers/discovery.controller.js";

const router = express.Router();

router.post("/:id/discover", runDiscovery);

export default router;