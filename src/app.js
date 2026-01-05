
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const chatbotRouter = require("./routes/chatbot");
const chatbotV2Router = require("./routes/chatbotV2");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

app.use("/", chatbotRouter);
app.use("/", chatbotV2Router);

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
