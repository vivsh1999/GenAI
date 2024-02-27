require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const { htmlToMD } = require("./htmlToMD");
const { default: prompts } = require("./prompts");

// Using gemini-1.0-pro-latest for text prompts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });

async function run() {
  const resp = await htmlToMD([
    {
      title: "DC-metadata",
      url: "https://aeon.co/essays/the-birth-of-our-system-for-describing-web-content",
      promptType: "summarize_blog",
    },
    {
      title: "Kinship",
      url: "https://aeon.co/essays/on-the-shared-genetic-memories-between-us-the-cat-and-the-fly",
      promptType: "summarize_blog",
    },
    {
      title: "Whats a forest",
      url: "https://finshots.in/archive/whats-a-forest-anyway/",
      promptType: "summarize_blog",
    },
  ]);
  for (const item of resp) {
    if (item.success) {
      let prompt = prompts[item.promptType];
      const article = fs.readFileSync(`original/${item.file}`, "utf8");
      const result = await model.generateContent([prompt, article]);
      const text = result.response.text();
      fs.writeFileSync(`processed/${item.file}`, text, (err) => {
        console.error(err);
      });
    }
  }
}

run();
