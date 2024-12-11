import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3109;

app.use(express.json({ limit: "50mb" }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post("/", async (req, res) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "assistant",
          content:
            "Only return with the ICS file format content, nothing else (assume I will make it a .ics file and save it)"
        },
        {
          role: "assistant",
          content: `Assume today is ${
            new Date().toISOString().split("T")[0]
          } (YYYY-MM-DD) so if you don't see a year in the input data, assume it is after today`
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: req.body.image
              }
            },
            {
              type: "text",
              text: "Analyze this screenshot and respond with a ICS file format content containing the calendar event details, detect the correct timezone (if there is an origin and destination, use the timezone of the origin)"
            }
          ]
        }
      ]
    });

    res.json(msg);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
