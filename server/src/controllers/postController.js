// postController module
const createPost = async (req, res) => {
    try {
        const { type, content } = req.body;

        // Handle image upload if present
        let imageUrl;
        if (req.file) {
            imageUrl = await imageService.processAndUpload(req.file);
        }

        const post = new Post({
            author: req.user.id,
            type,
            content: {
                text: content.text,
                imageUrl,
                description: content.description,
            },
            shareableLink: generateUniqueLink(),
        });

        await post.save();

        // Cache the new post
        await cacheService.setPost(post._id, post);

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error creating post" });
    }
};
