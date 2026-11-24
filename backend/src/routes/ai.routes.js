import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.get("/test", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "Explain market research in two simple sentences."
    });

    res.status(200).json({
      success: true,
      response: response.text
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      message: "Gemini test failed"
    });
  }
});

export default router;