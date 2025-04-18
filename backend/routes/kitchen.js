import express from "express";
import { createKitchen } from "../controllers/kitchenController.js";

const router = express.Router();

router.post("/", createKitchen);

export default router;