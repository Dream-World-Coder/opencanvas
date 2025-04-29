const readImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const validateFile = async (file, aspectCheckNeeded) => {
    if (!file) {
        throw new Error("File not found");
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            "Invalid file type. Please upload a JPG, JPEG or PNG image.",
        );
    }

    if (file.size > MAX_SIZE) {
        throw new Error("File size exceeds 10MB limit.");
    }

    if (aspectCheckNeeded) {
        const image = await readImageFromFile(file);
        const aspectRatio = image.width / image.height;
        const targetRatio = 16 / 9;

        // some tolerance (±5%)
        const tolerance = 0.05;
        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
            throw new Error("Image aspect ratio should be approximately 16:9.");
        }
    }
};

export const uploadImage = async (file) => {
    await validateFile(file, false);

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:3000/api/uploadImage", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Upload failed");
    }

    return {
        directLink: data.directLink,
        imgDeleteHash: data.imgDeleteHash,
    };
};
