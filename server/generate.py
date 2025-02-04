import os

def create_project_structure(base_dir):
    structure = {
        "config": ["database.js", "cloudStorage.js"],
        "models": ["User.js", "Post.js", "Comment.js"],
        "middlewares": ["auth.js", "validation.js", "rateLimit.js", "imageProcessing.js"],
        "routes": ["auth.js", "posts.js", "users.js", "comments.js"],
        "controllers": ["authController.js", "postController.js", "userController.js"],
        "services": ["imageService.js", "cacheService.js", "notificationService.js"],
        "utils": ["responses.js", "validators.js"],
    }

    for folder, files in structure.items():
        folder_path = os.path.join(base_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        for file in files:
            file_path = os.path.join(folder_path, file)
            if not os.path.exists(file_path):
                with open(file_path, "w") as f:
                    f.write("// " + file.split(".")[0] + " module\n")

if __name__ == "__main__":
    base_directory = "src"
    os.makedirs(base_directory, exist_ok=True)
    create_project_structure(base_directory)
    print("Project structure created successfully.")
