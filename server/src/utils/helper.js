const crypto = require("crypto");

function generateRandomAlphanumeric(length) {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const result = [];

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        result.push(charset[randomIndex]);
    }

    return result.join("");
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

module.exports = { generateRandomAlphanumeric, generateRandomThumbnail };
