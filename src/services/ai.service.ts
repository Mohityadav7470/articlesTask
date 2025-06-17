import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
})
const genAI = new GoogleGenerativeAI("AIzaSyBwhFNgW_-uQ00DC4U3-RrCgTjv87BCS7k");

export const getDescriptionFromGoogleGenerativeAI = async (
  topic: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

  const prompt = `Write a 200 words clear description about ${topic}.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text().trim();
};
