function generateRandomAlphanumeric(length) {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charsetLength = charset.length;
    const result = [];
    const randomValues = new Uint32Array(length);

    // Fill the array with cryptographically strong random values
    window.crypto.getRandomValues(randomValues);

    // Map each random value to a character in the charset
    for (let i = 0; i < length; i++) {
        result.push(charset[randomValues[i] % charsetLength]);
    }

    return result.join("");
}

module.exports = { generateRandomAlphanumeric };
