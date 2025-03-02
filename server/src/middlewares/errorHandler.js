const express = require("express");
const router = express.Router();

require("dotenv").config();

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Server error",
    });
});

module.exports = {
    router,
};
