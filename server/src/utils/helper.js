const crypto = require("crypto");
const User = require("../models/User");

function generateRandomAlphanumeric(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  const result = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    result.push(charset[randomIndex]);
  }

  return result.join("");
}

function generateRandomUsername(name) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const chars = letters + "0123456789_";

  // Sanitize input to allow only valid characters, default to empty string
  const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9_]/g, "") : "";
  const prefix = cleanName.slice(0, 4);

  while (true) {
    const totalLength = Math.floor(Math.random() * 5) + 6; // 6–10
    const remainingLength = Math.max(0, totalLength - prefix.length);

    let randomPart = "";
    let hasLetter = false;

    // Check if the prefix already contains a letter
    for (let char of prefix) {
      if (letters.includes(char)) hasLetter = true;
    }

    for (let i = 0; i < remainingLength; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      randomPart += char;
      if (letters.includes(char)) hasLetter = true;
    }

    const finalUsername = prefix + randomPart;

    // Ensure it has at least one letter
    if (hasLetter && finalUsername.length >= 6) {
      return finalUsername;
    }
  }
}

async function generateUniqueUsername() {
  let username;
  let exists;
  do {
    username = generateRandomUsername();
    exists = await User.findOne({ username });
  } while (exists);
  return username;
}

function randomNo(n) {
  return Math.floor(Math.random() * n) + 1;
}

function generateRandomThumbnail(artType) {
  switch (artType) {
    case "poem":
    case "story":
      return `/defaults/${artType}.jpeg`;

    case "article":
    case "profile":
      return `/defaults/${artType}_${randomNo(3)}.jpeg`;

    default:
      return `https://picsum.photos/400`;
  }
}

module.exports = {
  generateRandomAlphanumeric,
  generateRandomThumbnail,
  generateRandomUsername,
  generateUniqueUsername,
};
