export const validateFile = async (file) => {
    if (!file) {
        throw new Error("File not found");
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        // "image/svg+xml", // imgur does not support svg
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            "Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.",
        );
    }

    if (file.size > MAX_SIZE) {
        throw new Error("File size exceeds 10MB limit.");
    }
};

export const uploadImage = async (file) => {
    await validateFile(file);

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://127.0.0.1:3000/api/uploadImage", {
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
