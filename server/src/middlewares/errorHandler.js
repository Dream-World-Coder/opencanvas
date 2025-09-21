const express = require("express");
const router = express.Router();

require("dotenv").config();

router.use((err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";

  // Handle payload too large (from body-parser / raw-body)
  if (err.type === "entity.too.large" || err.name === "PayloadTooLargeError") {
    statusCode = 413;
    message = "Payload too large";
    console.warn("Payload too large");
  }
  // Handle malformed JSON (body-parser throws SyntaxError)
  else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
    console.warn("Invalid JSON payload");
  } else {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = { router };
