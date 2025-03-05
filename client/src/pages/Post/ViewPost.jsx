import { useState, useEffect } from "react";
import { MarkdownPreview } from "../CreatePosts/Writing/WritingComponents";
import Header from "../../components/Header/Header";
import { Helmet } from "react-helmet-async";

// Its the public view --> add options like link share

export default function ViewPost(postId) {
    // Function to fetch posts from user's postIds array
    // const fetchUserPosts = async () => {
    //     try {
    //         setLoading(true);
    //         const token = localStorage.getItem("authToken");
    //         if (
    //             !currentUser ||
    //             !currentUser.posts ||
    //             currentUser.posts.length === 0
    //         ) {
    //             setPosts([]);
    //             setLoading(false);
    //             return;
    //         }

    //         if (currentUser.posts.length < postsToFetch) return;

    //         // post IDs to query string
    //         const postIdsParam = currentUser.posts
    //             .slice(0 + postsToFetch, 10 + postsToFetch)
    //             .join(",");

    //         setPostsToFetch(postsToFetch + 10);

    //         const response = await fetch(
    //             `http://127.0.0.1:3000/u/posts/byids`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     postIds: postIdsParam,
    //                 }),
    //             },
    //         );

    //         const data = await response.json();

    //         if (data.success) {
    //             setPosts((prevPosts) => [...prevPosts, ...data.posts]);
    //         } else {
    //             console.error("Failed to fetch posts: ", data.message);
    //             toast("Failed to fetch posts: ", data.message);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching posts: ", error);
    //         toast("Error fetching posts: ", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    return <></>;
}
