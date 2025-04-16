import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: "0.0.0.0",
        cors: {
            origin: [
                "http://localhost:3000",
                "http://localhost:5174",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5174",
            ],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
