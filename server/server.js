const express = require("express");
const gTTS = require("gtts");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post("/convert", (req, res) => {
  const { text, lang } = req.body;
  if (!text || !lang) {
    return res.status(400).send("Text and language are required.");
  }
  const gtts = new gTTS(text, lang);
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", 'inline; filename="audio.mp3"');
  gtts
    .stream()
    .on("error", (err) => {
      console.error("Error in gTTS stream:", err);
      res.status(500).send("Error generating audio.");
    })
    .pipe(res);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
