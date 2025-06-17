import { Request, Response } from "express";
import { getDescriptionFromGoogleGenerativeAI } from "../services/ai.service";

export const generateDescription = async (req: Request, res: Response) => {
  const { topic } = req.body;

  if (!topic) {
    throw new Error("Topic is required.");
  }

  try {
    const description = await getDescriptionFromGoogleGenerativeAI(topic);
    res.json({ topic, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get description from Google Generative AI." });
  }
};
