import express from "express";
import { createResearch, getResearch } from "../controllers/research.controller.js";
import { runNicheResearch } from "../controllers/niche.controller.js";
import {
  analyzeCompetitor,
  generatePlaybook,
  generatePositioning,
} from "../controllers/marketTools.controller.js";

const router = express.Router();

router.post("/", createResearch);
router.get("/:id", getResearch);
router.post("/niche", runNicheResearch);
router.post("/competitor", analyzeCompetitor);
router.post("/playbook", generatePlaybook);
router.post("/positioning", generatePositioning);

export default router;