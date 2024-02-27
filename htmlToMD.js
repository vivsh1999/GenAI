const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");
const TurndownService = require("turndown");

async function fetchHtmlFromUrl(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return null;
  }
}
function extractTextContent(url, html) {
  const $ = cheerio.load(html);
  $("script").remove(); // Remove script tags
  $("style").remove(); // Remove script tags
  $("head").remove(); // Remove script tags
  // Add more filters or manipulations as needed
  if (url.includes("aeon")) {
    // Extract main textual content (example: blog post content)
    const mainContent = $("#article-content > div:first-child");
    mainContent.remove("div");
    return mainContent.html();
  }
  return $("main").html() || $.html();
}
async function htmlToMD(units) {
  const turndownService = new TurndownService();
  const processed = fs.readdirSync("processed");
  let response = [...units];
  for (const [i, item] of units.entries()) {
    try {
      const file = item.title + ".md";
      if (!processed.includes(file)) {
        let html = await fetchHtmlFromUrl(item.url);
        html = extractTextContent(item.url, html);
        const markdown = turndownService.turndown(html);
        fs.writeFileSync(`original/${file}`, markdown, (err) => {
          console.error(err);
        });
        response[i].file = file;
        response[i].success = true;
      } else {
        response[i].message = "ALREADY_PROCESSED";
        response[i].success = false;
      }
    } catch (err) {
      console.error(err);
      response[i].message = err.message;
      response[i].success = false;
    }
  }
  return response;
}
exports.htmlToMD = htmlToMD;
