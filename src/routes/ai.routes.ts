import { Router } from "express";
import { generateDescription } from "../controllers/ai.controller"

const router = Router();

router.post("/describe", generateDescription);

export default router;