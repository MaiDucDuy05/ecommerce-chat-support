import { Request, Response } from "express";
import { client } from "../config/db";
import { callAgent } from "../agents/agent";

export async function startChat(req: Request, res: Response) {
  const initialMessage = req.body.message;
  const threadId = Date.now().toString();

  try {
    const response = await callAgent(client, initialMessage, threadId);
    res.json({ threadId, response });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function continueChat(req: Request, res: Response) {
  const { threadId } = req.params;
  const { message } = req.body;

  try {
    const response = await callAgent(client, message, threadId);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
