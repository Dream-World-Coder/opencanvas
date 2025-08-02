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

function generateRandomUsername() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const chars = letters + "0123456789_";
  let username = "";

  while (true) {
    const length = Math.floor(Math.random() * 5) + 6; // 6–10
    username = "";
    let hasLetter = false;

    for (let i = 0; i < length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      username += char;
      if (letters.includes(char)) hasLetter = true;
    }

    // Ensure it's not only numbers and has at least one letter
    if (hasLetter) break;
  }

  return username;
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
