import { Router } from "express";
import { startChat, continueChat } from "../controllers/chatController";

const router = Router();

router.post("/", startChat);
router.post("/:threadId", continueChat);

export default router;