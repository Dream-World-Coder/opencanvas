import axios from "axios";

// Create a fingerprint storage service
const FingerprintService = {
    // Promise to hold the FingerprintJS instance
    fpPromise: null,

    // Initialize the FingerprintJS instance
    initialize() {
        // Only initialize once
        if (!this.fpPromise) {
            // Using the npm package approach (if installed via npm/yarn)
            if (typeof window !== "undefined") {
                import("@fingerprintjs/fingerprintjs")
                    .then((FingerprintJS) => {
                        this.fpPromise = FingerprintJS.load();
                    })
                    .catch((error) => {
                        console.error("Error loading FingerprintJS:", error);
                        this.fpPromise = null;
                    });
            }
        }
        return this.fpPromise;
    },

    async getVisitorId() {
        // Check localStorage first for cached identifier
        const storedId = localStorage.getItem("visitor_fingerprint");
        if (storedId) return storedId;

        // If no stored ID, generate a new one
        try {
            // Initialize if not already done
            if (!this.fpPromise) {
                this.initialize();
            }

            // Wait for the FingerprintJS instance to be ready
            if (this.fpPromise) {
                const fp = await this.fpPromise;
                const result = await fp.get();
                const visitorId = result.visitorId;

                // Store for future use
                localStorage.setItem("visitor_fingerprint", visitorId);
                return visitorId;
            } else {
                throw new Error("FingerprintJS failed to initialize");
            }
        } catch (error) {
            console.error("Error getting visitor ID:", error);

            // Fallback to a random ID if fingerprinting fails
            const fallbackId = `fallback_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem("visitor_fingerprint", fallbackId);
            return fallbackId;
        }
    },
};

// Initialize FingerprintJS when the service is imported
FingerprintService.initialize();

// Enhanced axios interceptor to include fingerprint in requests
axios.interceptors.request.use(
    async (config) => {
        // Check if this is a request that needs fingerprinting
        if (config.url && config.url.includes("/update-post-views")) {
            try {
                const fingerprint = await FingerprintService.getVisitorId();
                config.headers["X-Visitor-ID"] = fingerprint;
            } catch (error) {
                console.error("Failed to add fingerprint to request:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default FingerprintService;
