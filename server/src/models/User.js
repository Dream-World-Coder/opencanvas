// User module
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        profilePicture: String,
        bio: String,
        posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        // followers: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "User",
        //     },
        // ],
        // following: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "User",
        //     },
        // ],
    },
    {
        timestamps: true,
    },
);
export default mongoose.model("User", userSchema);
