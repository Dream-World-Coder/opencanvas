import { useState } from "react";
import Header from "@/components/Header/Header";
import { X } from "lucide-react";

const ImageUploadPage = () => {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoriesFor, setShowCategoriesFor] = useState(null); // Track which image is showing the category selector

  // Image categories
  const categories = [
    "Nature",
    "Urban",
    "Portrait",
    "Food",
    "Travel",
    "Architecture",
    "Abstract",
    "Photography",
  ];

  const handleImageSelect = (e) => {
    if (e.target.files.length) {
      const newImages = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        categories: ["defaultUpload"], // Default category that's not visible to user
        id: Date.now() + Math.random().toString(36).substr(2, 9),
      }));

      setImages([...images, ...newImages]);
    }
  };

  const toggleCategory = (imageId, category) => {
    setImages(
      images.map((img) => {
        if (img.id === imageId) {
          // If category already exists, remove it. Otherwise, add it.
          const hasCategory = img.categories.includes(category);

          // Don't allow removing the default category
          if (category === "defaultUpload" && hasCategory) {
            return img;
          }

          // User can only add up to 5 categories (including defaultUpload)
          if (!hasCategory && img.categories.length >= 5) {
            alert("You can only add up to 4 custom categories per image");
            return img;
          }

          const updatedCategories = hasCategory
            ? img.categories.filter((c) => c !== category)
            : [...img.categories, category];

          return { ...img, categories: updatedCategories };
        }
        return img;
      }),
    );
  };

  const toggleCategorySelector = (id) => {
    setShowCategoriesFor(showCategoriesFor === id ? null : id);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
    if (showCategoriesFor === id) {
      setShowCategoriesFor(null);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      // mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Images to upload:", images);
      alert("Upload successful!");
      setImages([]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-8 pb-52 pt-32">
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center font-serif">
          <h1 className="text-3xl font-bold text-gray-900">Upload Images</h1>
          <p className="mt-2 text-gray-600">
            Uploaded images will be public so please do not upload sensitive
            data
          </p>
        </div>

        {/* Upload area */}
        <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition flex items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-600">Click to upload images</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, JPEG up to 10MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleImageSelect}
            multiple
            accept="image/*"
          />
        </label>

        {/* Preview area */}
        {images.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Selected Images
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative bg-white rounded-lg shadow overflow-hidden"
                >
                  {/* Image preview */}
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Categories display */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {image.categories
                        .filter((cat) => cat !== "defaultUpload")
                        .map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800"
                          >
                            {category}
                            <button
                              onClick={() => toggleCategory(image.id, category)}
                              className="ml-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center bg-lime-400 text-white"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}

                      {/* Add category button */}
                      <button
                        onClick={() => toggleCategorySelector(image.id)}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        {showCategoriesFor === image.id ? (
                          <X className="size-3.5" />
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-0.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    </div>

                    {/* Category selector dropdown */}
                    {showCategoriesFor === image.id && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          {categories.map((category) => {
                            const isSelected =
                              image.categories.includes(category);
                            return (
                              <div key={category} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${image.id}-${category}`}
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleCategory(image.id, category)
                                  }
                                  className="rounded text-lime-500 focus:ring-lime-500 mr-1.5"
                                />
                                <label
                                  htmlFor={`${image.id}-${category}`}
                                  className="text-gray-700 text-xs"
                                >
                                  {category}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-500 transition"
                  >
                    <svg
                      className="h-5 w-5 text-gray-700"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Upload button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading || images.length === 0}
                className={`px-6 py-3 mt-12 rounded-full font-bold border border-black shadow ${
                  isUploading || images.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black/0 hover:bg-black text-black hover:text-white"
                } transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Upload Images"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadPage;
