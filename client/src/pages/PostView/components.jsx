import { useRef, useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import {
  X,
  Eye,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquareText,
  ChevronLeft,
  Palette,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  Edit,
  Trash2,
  Reply,
  List,
  PlusCircle,
  MinusCircle,
  BookMarked,
  Link,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Header from "../../components/Header/Header";
import { generateId } from "@/services/regex";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuth } from "../../contexts/AuthContext";
import { useDataService } from "../../services/dataService";
import { postDarkThemes } from "../../services/themes";
import { copyHeaderLink } from "../../services/copyToClipBoard";
import { timeAgo } from "../../services/formatDate";
import { CodeBlock } from "@/pages/Create/Editor/components";
/**
 *
 */
function sharePost(post) {
  const baseUrl = window.location.origin;
  const postUrl = `${baseUrl}/p/${post._id}`;

  navigator.clipboard
    .writeText(postUrl)
    .then(() => {
      toast.success("Link copied to clipboard", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
    })
    .catch((err) => {
      console.error("Failed to copy link:", err);
      toast.error("Faild to copy link");
    });
}

/**
 *
 */
export const PostHelmet = ({ post, author }) => {
  function formatSchemaDate(date) {
    return new Date(date).toISOString();
  }
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [`${window.location.origin}${post.thumbnailUrl}`],
    datePublished: formatSchemaDate(post.createdAt),
    dateModified: formatSchemaDate(post.modifiedAt),
    author: {
      "@type": "Person",
      name: author.fullName,
    },
    publisher: {
      "@type": "Organization",
      name: "Opencanvas",
      logo: {
        "@type": "ImageObject",
        url: "https://opencanvas.blog/logo.png",
      },
    },
    description: post.title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${window.location.origin}/p/${post._id}`,
    },
    keywords: [...post.tags],
  };

  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "to",
    "of",
    "in",
    "on",
    "at",
    "with",
    "for",
    "from",
    "by",
  ];

  const keywordList = [
    ...new Set(
      post.title
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => !stopWords.includes(word)),
    ),
    ...post.tags,
    "opencanvas",
  ].join(", ");

  return (
    <Helmet>
      <title>{post.title} | OpenCanvas</title>
      <meta name="description" content={post.title} />
      <meta name="keywords" content={keywordList} />
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

PostHelmet.propTypes = {
  post: PropTypes.object,
  author: PropTypes.object,
};

/**
 *
 */
export const LoadingPost = () => {
  return (
    <div className="flex justify-center items-center h-screen text-black dark:text-white">
      Loading post...
    </div>
  );
};

/**
 *
 */
export const NotPost = () => {
  const navigate = useNavigate();
  return (
    <div className="">
      <Header />
      <div className="flex text-base flex-col justify-center items-center h-screen text-black dark:text-white gap-3">
        Post not found
        <button
          className="rounded-md text-sm bg-cream hover:bg-cream-dark box-content px-2 py-1 text-stone-600/80 flex items-center justify-center gap-2"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ChevronLeft className="size-6" />
          Go Back
        </button>
      </div>
    </div>
  );
};

/**
 *
 */
export const NotPublicPost = () => {
  return (
    <div className="w-full h-full grid place-items-center bg-white dark:bg-[#111] overflow-x-hidden pt-20">
      <Header noBlur={true} ballClr={"text-gray-300"} />
      <div className="flex justify-center items-center h-screen text-black dark:text-white">
        This Post is Private
      </div>
    </div>
  );
};
/*
It works because of the loading state,
the rendering is starting before the useEffect completion,
thus post.title is undefined. -> not acctually,
i mean many be the return() executes first before postId gets to change and ask for an re-render
But with loading on, the return statement is only a simple html, so it works
*/

/**
 *
 */

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const LeftSidebar = () => {
  // for ads [bottom, fixed, masked] + playlist items top[scrollable]

  // const _list = Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10); // useMemo
  const list = Array.from({ length: 10 }, (_, i) => i);

  return (
    <>
      <div className="md:hidden w-full fixed bottom-0 dark:text-white">
        <Drawer>
          <DrawerTrigger className="bg-lime-300 w-full py-2 rounded-t-xl z-[50000]">
            serial num. Short title of current article
            <br />
            Lorem ipsum dolor sit amet.
          </DrawerTrigger>

          <DrawerContent className="max-h-[60vh] flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Collection Name</DrawerTitle>
            </DrawerHeader>

            {/* Scrollable body */}
            <div className="px-4 py-2 overflow-y-auto flex-1">
              {list.map((index) => (
                <div
                  key={index}
                  className={`px-2 py-4 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0
                  font-thin text-sm leading-tight border-b border-dashed
                  ${index === 2 && "bg-lime-100 hover:bg-lime-100"}`}
                >
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Consequatur, numquam eveniet? Accusamus, minima!
                </div>
              ))}
            </div>

            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <aside
        className={`relative w-full md:w-72 px-4 py-6 hidden md:flex flex-col _bg-lime-400 md:mr-4`}
      >
        {/* listItems */}
        <div className="dark:text-white">
          <div className="mb-4 pl-2">Collection Name</div>

          <div className="max-h-screen overflow-y-auto _thin_ no-scrollbar">
            {list.map((index) => (
              <div
                key={index}
                className={`pl-2 py-4 rounded hover:bg-gray-100 dark:hover:bg-[#333] transition duration-0
                  text-sm leading-tight border-b border-dashed border-neutral-400 dark:border-neutral-700 dark:text-neutral-200
                  ${index === 2 && "bg-lime-100 dark:bg-[#333] hover:bg-lime-100 dark:hover:bg-[#333]"}`}
              >
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Consequatur, numquam eveniet? Accusamus, minima!
              </div>
            ))}
          </div>
        </div>

        {/* ads */}
        <div className=""></div>
      </aside>
    </>
  );
};

/**
 *
 */

export const TableOfContents = memo(function Toc({
  tableOfContents,
  isArticle,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="w-full h-full lg:w-72 relative">
      {/* the aside is the relative place holder of the fixed element */}
      {isArticle && (
        <div className="fixed top-20 lg:top-24 right-4 lg:right-16 2xl:right-16 w-52 lg:w-72 2xl:w-[400px] px-0 _border border-green-200 no-scrollbar">
          <summary
            className="flex items-center justify-start gap-1 py-2 cursor-pointer list-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* for desktop */}
            <div className="hidden lg:block font-serif text-xl px-2 bg-lime-200 dark:bg-neutral-700 rounded text-black dark:text-[#f8f8f8]">
              Table of Contents
            </div>
            <div className="hidden lg:block dark:text-neutral-500">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {/* for mobile */}
            <div className="flex lg:hidden w-full justify-end">
              {isOpen ? (
                <X className="size-4 bg-lime-200 dark:bg-neutral-700 box-content p-1 rounded" />
              ) : (
                <List className="size-4 bg-lime-200 dark:bg-neutral-700 box-content p-1 rounded" />
              )}
            </div>
          </summary>

          {isOpen && (
            <div
              data-lenis-prevent
              className="dropdown max-h-[600px] overflow-y-auto pb-4 bg-lime-100 dark:bg-neutral-700
              rounded lg:bg-transparent lg:dark:bg-transparent shadow-md md:shadow-none no-scrollbar"
            >
              <ul className="pl-1 pt-2">
                {tableOfContents.map((title, titleIndex) => (
                  <li key={`title-${titleIndex}`} className="mb-1">
                    {title.text && (
                      <a
                        href={`#${title.id}`}
                        className="font-bold text-base text-neutral-800 dark:text-neutral-300 hover:underline leading-tight"
                      >
                        {title.text}
                      </a>
                    )}

                    {title.headings.length > 0 && (
                      <details open className="pl-0 mt-1">
                        <summary className="list-none text-sm text-neutral-500 dark:text-neutral-300 cursor-pointer">
                          {/* Expand sections */}
                        </summary>
                        <ul className="pl-4 mt-1">
                          {title.headings.map((heading, headingIndex) => (
                            <li
                              key={`heading-${titleIndex}-${headingIndex}`}
                              className="mb-0"
                            >
                              {heading.text && (
                                <a
                                  href={`#${heading.id}`}
                                  className="font-medium text-sm text-neutral-700 dark:text-neutral-300 hover:underline leading-tight"
                                >
                                  {heading.text}
                                </a>
                              )}

                              {heading.subheadings.length > 0 && (
                                <details open className="mt-1">
                                  <summary className="list-none text-xs rounded px-1 w-fit bg-neutral-400/30 text-neutral-500 dark:text-neutral-400 cursor-pointer ml-2">
                                    Subsections
                                  </summary>
                                  <ul className="pl-4 mt-1">
                                    {heading.subheadings.map(
                                      (subheading, subheadingIndex) => (
                                        <li
                                          key={`subheading-${titleIndex}-${headingIndex}-${subheadingIndex}`}
                                          className="mb-0"
                                        >
                                          {subheading.text && (
                                            <a
                                              href={`#${subheading.id}`}
                                              className="text-neutral-600 dark:text-neutral-300 text-xs hover:underline leading-tight"
                                            >
                                              {subheading.text}
                                            </a>
                                          )}

                                          {subheading.h4s.length > 0 && (
                                            <details open className="mt-1">
                                              <summary className="list-none text-xs text-neutral-400 cursor-pointer ml-2 rounded px-1 w-fit bg-neutral-400/30">
                                                Subsections
                                              </summary>
                                              <ul className="pl-4 mt-1">
                                                {subheading.h4s.map(
                                                  (h4, h4Index) => (
                                                    <li
                                                      key={`h4-${titleIndex}-${headingIndex}-${subheadingIndex}-${h4Index}`}
                                                    >
                                                      <a
                                                        href={`#${h4.id}`}
                                                        className="text-neutral-500 dark:text-neutral-400 hover:underline text-xs leading-tight"
                                                      >
                                                        {h4.text}
                                                      </a>
                                                    </li>
                                                  ),
                                                )}
                                              </ul>
                                            </details>
                                          )}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </details>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
});
TableOfContents.propTypes = {
  tableOfContents: PropTypes.array,
  isArticle: PropTypes.bool,
};
export const RightSidebar = memo(function RightSidebar({
  content,
  isArticle = true,
}) {
  // // ignore contents inside code block, i.e. enclosed by ` or ```
  // content = content.replace(/```[\s\S]*?```|`[\s\S]*?`/g, "");
  // remove contents inside triple backtick blocks only
  content = content.replace(/```[\s\S]*?```/g, "");

  // Parse content to build the table of contents
  const parseTableOfContents = (content) => {
    if (!content) return [];

    const lines = content.split("\n");
    const tableOfContents = [];
    let currentTitle = null;
    let currentHeading = null;
    let currentSubheading = null;

    for (const line of lines) {
      // Check for title (# heading)
      if (line.startsWith("# ")) {
        const text = line.substring(2).trim();
        const id = generateId(text);
        currentTitle = { text, id, headings: [] };
        tableOfContents.push(currentTitle);
        currentHeading = null;
        currentSubheading = null;
      }
      // Check for heading (## heading)
      else if (line.startsWith("## ")) {
        const text = line.substring(3).trim();
        const id = generateId(text);
        currentHeading = { text, id, subheadings: [] };

        // If no title yet, create a container for headings
        if (!currentTitle) {
          currentTitle = { text: "", id: "", headings: [] };
          tableOfContents.push(currentTitle);
        }

        currentTitle.headings.push(currentHeading);
        currentSubheading = null;
      }
      // Check for subheading (### heading)
      else if (line.startsWith("### ")) {
        const text = line.substring(4).trim();
        const id = generateId(text);
        currentSubheading = { text, id, h4s: [] };

        // If no heading yet, create one
        if (!currentHeading && currentTitle) {
          currentHeading = { text: "", id: "", subheadings: [] };
          currentTitle.headings.push(currentHeading);
        } else if (!currentHeading && !currentTitle) {
          currentTitle = { text: "", id: "", headings: [] };
          currentHeading = { text: "", id: "", subheadings: [] };
          tableOfContents.push(currentTitle);
          currentTitle.headings.push(currentHeading);
        }

        currentHeading.subheadings.push(currentSubheading);
      }
      // Check for h4 (#### heading)
      else if (line.startsWith("#### ")) {
        const text = line.substring(5).trim();
        const id = generateId(text);
        const h4 = { text, id };

        // Handle case where we don't have proper hierarchy
        if (!currentSubheading && currentHeading) {
          currentSubheading = { text: "", id: "", h4s: [] };
          currentHeading.subheadings.push(currentSubheading);
        } else if (!currentSubheading && !currentHeading && currentTitle) {
          currentHeading = { text: "", id: "", subheadings: [] };
          currentSubheading = { text: "", id: "", h4s: [] };
          currentTitle.headings.push(currentHeading);
          currentHeading.subheadings.push(currentSubheading);
        } else if (!currentSubheading && !currentHeading && !currentTitle) {
          currentTitle = { text: "", id: "", headings: [] };
          currentHeading = { text: "", id: "", subheadings: [] };
          currentSubheading = { text: "", id: "", h4s: [] };
          tableOfContents.push(currentTitle);
          currentTitle.headings.push(currentHeading);
          currentHeading.subheadings.push(currentSubheading);
        }

        currentSubheading.h4s.push(h4);
      }
    }

    return tableOfContents;
  };

  const tableOfContents = parseTableOfContents(content);

  return (
    <div className=" _bg-lime-400 md:ml-4">
      <TableOfContents
        tableOfContents={tableOfContents}
        isArticle={isArticle}
      />
    </div>
  );
});
RightSidebar.propTypes = {
  content: PropTypes.string,
  isArticle: PropTypes.bool,
};

export const ThemeSelector = ({ darkTheme, setDarkTheme }) => {
  // const isDark = useDarkMode();
  const { darkMode: isDark, setDarkTheme: setDark } = useDarkModeContext();

  const handleThemeChange = (themeKey) => {
    if (!isDark) {
      setDark(true);
    }
    if (themeKey === "light" && isDark) {
      setDark(false);
    }
    setDarkTheme(postDarkThemes[themeKey]);
  };

  function getPreviewColor(themeKey) {
    switch (themeKey) {
      case "monokai":
        return "bg-[#272822]";
      case "oneDark":
        return "bg-[#282c34]";
      case "dark":
        return "bg-[#111]";
      default:
        return "bg-gray-100";
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center">
          <Palette
            className="size-4 cursor-pointer rounded px-2 py-1 box-content
              hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.keys(postDarkThemes).map((themeKey) => (
          <DropdownMenuItem
            key={themeKey}
            className="flex items-center justify-between px-3 py-2 cursor-pointer"
            onClick={() => handleThemeChange(themeKey)}
          >
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${getPreviewColor(themeKey)}`}
              />
              <span>{postDarkThemes[themeKey].name}</span>
            </div>
            {darkTheme.name === postDarkThemes[themeKey].name && (
              <Check className="size-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
ThemeSelector.propTypes = {
  darkTheme: PropTypes.object,
  setDarkTheme: PropTypes.func,
};
/**
 *
 */
export const ArticleHeader = ({
  post,
  currentUser,
  author,
  handleSave,
  handleFollow,
  following,
  isSaved,
  darkTheme,
  setDarkTheme,
}) => {
  const navigate = useNavigate();
  const { setPostIdToSave } = useCollectionContext();

  function formatDate(dt) {
    const date = new Date(dt);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return formattedDate;
  }

  return (
    <div
      className="w-full flex flex-col md:flex-row items-start md:items-center justify-between
      space-y-2 md:space-y-0 mb-10 md:mb-8 _bg-blue-400"
    >
      <div className="flex justify-center items-center gap-2">
        {/* back btn */}
        <button
          className="rounded-full text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#111]
              border box-content p-1 text-stone-600/80 dark:border-[#333] cursor-pointer"
          onClick={() => {
            navigate("/articles");
          }}
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* author details */}
        <div
          className="flex items-center cursor-pointer mr-12"
          onClick={() => {
            navigate(`/u/${author.username}`);
            // navigate(`/u/${author.username}`, {
            //     state: { author },
            // });
          }}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage
              src={author.profilePicture || post.author.profilePicture}
              alt={author.fullName || "U"}
            />
            <AvatarFallback className="bg-gradient-to-r from-lime-500 to-green-500 text-white font-stardom">
              {author.fullName.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="">
            <div
              className={`font-medium flex items-center justify-start gap-2 ${darkTheme.colors.primaryText}`}
            >
              {author.fullName || post.author.name || "not found"}

              {currentUser?._id?.toString() !== post.authorId?.toString() && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                      toast.error("you need to log in first to follow");
                      localStorage.setItem(
                        "urlToRedirectAfterLogin",
                        window.location.pathname,
                      );
                      navigate("/login-needed");
                      return;
                    }
                    await handleFollow(post.authorId);
                  }}
                  className={`px-1 rounded text-xs cursor-pointer dark:invert
                    ${following ? "bg-white text-black" : "bg-black text-white"}`}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <div className={`text-sm text-gray-500 dark:text-gray-300`}>
              {author.designation}
            </div>
          </div>
        </div>
      </div>

      {/* post options */}
      <div
        className="text-sm text-gray-500 dark:text-gray-300 flex flex-row md:flex-col
            justify-between md:justify-center gap-2 md:gap-0 w-full md:w-fit mt-2 md:mt-0"
      >
        <div>
          {formatDate(post.createdAt)} · {post.readTime || "2 min read"}
        </div>
        <div className="flex items-center justify-center text-white">
          <Bookmark
            className={`size-4 cursor-pointer rounded px-2 py-1 box-content
                hover:bg-gray-100 dark:hover:bg-[#333]
                ${isSaved ? "fill-lime-500 text-lime-500" : "dark:text-white text-black"}`}
            onClick={async () => {
              if (!currentUser) {
                toast.error("you need to log in first to save post");
                localStorage.setItem(
                  "urlToRedirectAfterLogin",
                  window.location.pathname,
                );
                navigate("/login-needed");
              } else {
                await handleSave(post._id);
              }
            }}
          />
          <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
          <Share2
            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                            hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
            onClick={() => sharePost(post)}
          />
          <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
          <ThemeSelector darkTheme={darkTheme} setDarkTheme={setDarkTheme} />

          {/* save in collection */}
          <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
          <BookMarked
            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                            hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
            onClick={() => {
              setPostIdToSave(post._id);
            }}
          />
        </div>
      </div>
    </div>
  );
};
ArticleHeader.propTypes = {
  post: PropTypes.object,
  darkTheme: PropTypes.object,
  currentUser: PropTypes.object,
  author: PropTypes.object,
  handleSave: PropTypes.func,
  handleFollow: PropTypes.func,
  setDarkTheme: PropTypes.func,
  following: PropTypes.bool,
  isSaved: PropTypes.bool,
};

/**
 *
 */
export const EngagementSection = ({
  post,
  currentUser,
  handleLike,
  handleDislike,
  handleSave,
  isLiked,
  isDisliked,
  isSaved,
  likes,
  commentTrayOpen,
  setCommentTrayOpen,
  darkTheme,
}) => {
  const navigate = useNavigate();
  const { setPostIdToSave } = useCollectionContext();

  return (
    <div
      className={`w-full flex items-center justify-between border-t border-b py-4 mb-8 dark:border-[#333]
        border-gray-200 ${darkTheme.colors.primaryText}`}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 cursor-not-allowed"
        >
          <Eye className="size-4" />
          <span>{post.totalViews}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={async () => {
            if (!currentUser) {
              toast.error("you need to log in first to like");
              localStorage.setItem(
                "urlToRedirectAfterLogin",
                window.location.pathname,
              );
              navigate("/login-needed");
            } else {
              await handleLike(post._id);
            }
          }}
        >
          <ThumbsUp
            className={`size-4 text-lime-600 dark:text-white ${isLiked ? "fill-lime-600 dark:fill-white" : ""}`}
          />
          <span>{likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-transparent"
          onClick={async () => {
            if (!currentUser) {
              toast.error("you need to log in first to dislike");
              localStorage.setItem(
                "urlToRedirectAfterLogin",
                window.location.pathname,
              );
              navigate("/login-needed");
            } else {
              await handleDislike(post._id);
            }
          }}
        >
          <ThumbsDown
            className={`size-4 text-black dark:text-white ${isDisliked ? "fill-black dark:fill-white" : ""}`}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setCommentTrayOpen(!commentTrayOpen)}
        >
          <MessageSquareText className="size-4" />
          <span>{post.totalComments}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* save */}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!currentUser) {
              toast.error("you need to log in first to save post");
              localStorage.setItem(
                "urlToRedirectAfterLogin",
                window.location.pathname,
              );
              navigate("/login-needed");
            } else {
              await handleSave(post._id);
            }
          }}
        >
          <Bookmark
            className={`size-4 ${isSaved ? "fill-lime-500 text-lime-500" : ""}`}
          />
        </Button>

        {/* save in collection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPostIdToSave(post._id);
          }}
        >
          <BookMarked className={`size-4`} />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => sharePost(post)}>
          <Share2 className="size-4" />
        </Button>
      </div>
    </div>
  );
};
EngagementSection.propTypes = {
  post: PropTypes.object,
  darkTheme: PropTypes.object,
  currentUser: PropTypes.object,
  handleLike: PropTypes.func,
  handleDislike: PropTypes.func,
  handleSave: PropTypes.func,
  setCommentTrayOpen: PropTypes.func,
  commentTrayOpen: PropTypes.bool,
  isLiked: PropTypes.bool,
  isDisliked: PropTypes.bool,
  isSaved: PropTypes.bool,
  likes: PropTypes.number,
};

// comments related
// ---------------------
const Comment = ({
  comment,
  currentUser,
  post,

  setIsEditing,
  editingCommentRef,

  setIsReplying,
  parentCommentRef,

  setNewComment,
  handleDelete,
  replyingTo,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-3 py-3 group text-wrap">
      <Avatar
        onClick={() => navigate(`/u/${comment.author.username}`)}
        className="size-6 rounded-full flex-shrink-0 cursor-pointer"
      >
        <AvatarImage
          src={comment.author.profilePicture}
          alt={comment.author.fullName}
        />
        <AvatarFallback className="font-thin">
          {comment.author.fullName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-3">
            {comment.author.fullName}
            <div className="flex items-center justify-center gap-2">
              {comment.authorId.toString() === currentUser?._id.toString() && (
                <>
                  {/* edit comment */}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setIsReplying(false);
                      setIsEditing(true);
                      editingCommentRef.current = comment;
                      setNewComment(comment.content);
                    }}
                  >
                    <Edit className="size-4" />
                  </div>

                  {/* delete comment */}
                  <AlertDialog className="cursor-pointer">
                    <AlertDialogTrigger className="size-4 p-0 m-0" asChild>
                      <Button variant="outline">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your comment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleDelete(e, comment._id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {/* reply to a comment */}
              {!comment.isReply && (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setIsEditing(false);
                    setIsReplying(true);
                    parentCommentRef.current = comment;
                  }}
                >
                  <Reply className="size-4" />
                </div>
              )}
            </div>
          </h3>
          <span className="text-xs text-gray-500 dark:text-neutral-400">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        {comment.authorId.toString() === post.authorId.toString() && (
          <span className="bg-lime-200 dark:bg-lime-700 rounded-full px-2 text-xs mr-2">
            Author
          </span>
        )}
        {comment.createdAt !== comment.modifiedAt && (
          <span className="bg-gray-200 dark:bg-neutral-700 rounded-full px-2 text-xs">
            edited
          </span>
        )}
        <p className="mt-1 text-gray-800 dark:text-neutral-200 text-wrap break-words max-w-72 text-sm font-light">
          {comment.isReply && (
            <span className="font-semibold">@{replyingTo.username}</span>
          )}{" "}
          {comment.content}
        </p>
      </div>
    </div>
  );
};
Comment.propTypes = {
  comment: PropTypes.object,
  currentUser: PropTypes.object,
  post: PropTypes.object,
  replyingTo: PropTypes.object,
  setIsEditing: PropTypes.func,
  editingCommentRef: PropTypes.object,
  setIsReplying: PropTypes.func,
  parentCommentRef: PropTypes.object,
  setNewComment: PropTypes.func,
  handleDelete: PropTypes.func,
};

export const CommentsBox = memo(function CommentsBox({
  post,
  commentTrayOpen,
  setCommentTrayOpen,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // would have been better to use set instead array
  const [replies, setReplies] = useState([]); // stores fetched replies for clicked comments, { comment: res.comment, replies: res.replies },
  const [replyOpenStatus, setReplyOpenStatus] = useState([]); // [{commentId, replyopen},{}]

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentIndexRef = useRef(0);
  const editingCommentRef = useRef(null);
  const parentCommentRef = useRef(null);

  function fetchedRepliesPresent(comment) {
    return (
      replies.find(
        (item) => item.comment._id.toString() === comment._id.toString(),
      )?.replies || false
    );
  }

  function isReplyOpen(id) {
    const match = replyOpenStatus.find(
      (i) => i.commentId.toString() === id.toString(),
    );
    return match?.openStatus || false;
  }

  const {
    addNewComment,
    editComment,
    deleteComment,
    newReply,
    getComment,
    getCommentsByIds,
  } = useDataService();

  // fetch comments
  useEffect(() => {
    async function loadComments() {
      // if (commentTrayOpen) { // autofetch some at first
      setLoading(true);
      try {
        const comments = await getCommentsByIds(post, currentIndexRef);
        setComments(comments);
        // no need to change no of comments using setPost
        currentIndexRef.current += 10;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    // }
    loadComments();
  }, [post]); //, commentTrayOpen]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentTrayOpen && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, commentTrayOpen]);

  // Focus input when tray opens
  useEffect(() => {
    if (commentTrayOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commentTrayOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed"); // a state can be added
      return;
    }
    const content = newComment.trim();
    if (content) {
      setLoading(true);
      try {
        const res = await addNewComment(content, post._id);
        console.log(res);
        setComments([...comments, res.comment]);
        setNewComment("");
        toast.success(res.message, {
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("No content found for comment");
      return;
    }
  };

  // not showing realtime update, problem
  const handleEdit = async (e, commentId) => {
    if (!currentUser) {
      toast.error("Login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }
    e.preventDefault();
    const content = newComment.trim();
    if (content) {
      setLoading(true);
      try {
        const res = await editComment(content, commentId);
        if (editingCommentRef.isReply) {
          let parentCommentId = editingCommentRef.parentId;

          setReplies((prev) => [
            ...prev.map((i) =>
              i.comment._id.toString() === parentCommentId.toString()
                ? {
                    ...i,
                    replies: [
                      ...i.replies.map((r) =>
                        r._id.toString() === commentId.toString()
                          ? {
                              ...r,
                              content: res.comment,
                            }
                          : r,
                      ),
                    ],
                  }
                : i,
            ),
          ]);
        } else {
          setComments((comms) => [
            ...comms.map((c) =>
              c._id.toString() === commentId.toString() ? res.comment : c,
            ),
          ]);
        }
        setNewComment("");
        editingCommentRef.current = null;
        toast.success(res.message, {
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsEditing(false);
        setLoading(false);
      }
    } else {
      toast.error("No content found for comment");
      return;
    }
  };

  const handleDelete = async (e, commentId) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await deleteComment(commentId);
      setComments([
        ...comments.filter((c) => c._id.toString() !== commentId.toString()),
      ]);
      toast.success(res.message, {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e, postId, parentId) => {
    if (!currentUser) {
      toast.error("You need to Login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }
    e.preventDefault();
    const content = newComment.trim();
    if (content) {
      setLoading(true);
      try {
        const res = await newReply(content, postId, parentId);
        setComments([
          ...comments.map((c) =>
            c._id.toString() === parentCommentRef.current._id.toString()
              ? { ...c, replies: [...c.replies, res.comment] }
              : c,
          ),
        ]);
        setNewComment("");
        parentCommentRef.current = null;
        toast.success(res.message, {
          action: {
            label: "Close",
            onClick: () => console.log("Close"),
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsReplying(false);
        setLoading(false);
      }
    } else {
      toast.error("No content found for comment");
      return;
    }
  };

  // load 20 replies later, now just load all replies,
  // keep an ref of comments whose replies are needed,
  // like {comm1: repliesfetched:20; comm2: repliesfetched:40} etc, refresh in new post
  const loadCommentsFamily = async (commentId) => {
    setLoading(true);
    try {
      const res = await getComment(commentId);
      setReplies((prev) => [
        ...prev,
        { comment: res.comment, replies: res.replies },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out
        ${commentTrayOpen ? "translate-x-0" : "translate-x-full"} flex flex-col h-full z-50`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-neutral-100">
          Comments
        </h2>
        <button
          onClick={() => setCommentTrayOpen(false)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          aria-label="Close comments"
        >
          <X size={20} className="text-gray-600 dark:text-neutral-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y-[1px]">
        {/* {!loading && <p>Loading...</p>} */}
        {comments?.length > 0
          ? comments.map((comment) => (
              <div key={comment._id}>
                <Comment
                  comment={comment}
                  currentUser={currentUser}
                  post={post}
                  setIsEditing={setIsEditing}
                  editingCommentRef={editingCommentRef}
                  setIsReplying={setIsReplying}
                  parentCommentRef={parentCommentRef}
                  setNewComment={setNewComment}
                  handleDelete={handleDelete}
                />
                {/* load replies */}
                {comment.replies?.length > 0 && !isReplyOpen(comment._id) && (
                  <div
                    onClick={async () => {
                      await loadCommentsFamily(comment._id);
                      setReplyOpenStatus((prev) => [
                        ...prev,
                        {
                          commentId: comment._id,
                          openStatus: true,
                        },
                      ]);
                    }}
                    className="flex items-center justify-start gap-2 pl-6 text-neutral-600 dark:text-neutral-400 text-sm mt-2 cursor-pointer"
                  >
                    <PlusCircle size={16} />
                    {comment.replies?.length}{" "}
                    {comment.replies?.length === 1 ? "reply" : "replies"}
                  </div>
                )}

                {/* close replies */}
                {comment.replies?.length > 0 && isReplyOpen(comment._id) && (
                  <div
                    onClick={() => {
                      setReplyOpenStatus((prev) => [
                        ...prev.filter(
                          (i) =>
                            i.commentId.toString() !== comment._id.toString(),
                        ),
                      ]);
                    }}
                    className="flex items-center justify-start gap-2 pl-8 text-neutral-600 dark:text-neutral-400 text-sm mt-2 cursor-pointer"
                  >
                    <MinusCircle size={16} />
                    {comment.replies?.length} replies
                  </div>
                )}

                {/* replies */}
                <div className={`pl-8`}>
                  {isReplyOpen(comment._id) &&
                    fetchedRepliesPresent(comment) && (
                      <div className="pl-2">
                        {fetchedRepliesPresent(comment).map((reply, index) => (
                          <Comment
                            key={index}
                            comment={reply}
                            currentUser={currentUser}
                            post={post}
                            setIsEditing={setIsEditing}
                            editingCommentRef={editingCommentRef}
                            setIsReplying={setIsReplying}
                            parentCommentRef={parentCommentRef}
                            setNewComment={setNewComment}
                            handleDelete={handleDelete}
                            replyingTo={comment.author}
                          />
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))
          : "no comments until now"}
        <div ref={commentsEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
        {/* message */}
        {isEditing && (
          <div className="dark:text-white px-2 pb-4 pt-0 text-sm w-full flex items-center justify-between">
            Editing
            <X
              className="cursor-pointer"
              size={16}
              onClick={() => {
                setIsEditing(false);
                editingCommentRef.current = null;
              }}
            />
          </div>
        )}
        {isReplying && (
          <div className="dark:text-white px-2 pb-4 pt-0 text-sm w-full flex items-center justify-between">
            <span>
              Replying to <u>@{parentCommentRef.current.author.username}</u>
            </span>
            <X
              className="cursor-pointer"
              size={16}
              onClick={() => {
                setIsReplying(false);
                parentCommentRef.current = null;
              }}
            />
          </div>
        )}
        <div className="relative flex items-center">
          <textarea
            rows={1}
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isEditing || isReplying ? "" : "Add a comment..."}
            className="flex-1 px-4 py-2 pr-10 bg-gray-100 dark:bg-neutral-800 border-0 rounded-full text-gray-800 dark:text-neutral-100 no-resize no-scrollbar
                        placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200"
          />
          <button
            onClick={(e) => {
              if (isEditing && !isReplying) {
                handleEdit(e, editingCommentRef.current._id);
              } else if (isReplying && !isEditing) {
                handleReply(e, post._id, parentCommentRef.current._id);
              } else if (!isReplying && !isEditing) {
                handleSubmit(e);
              } else {
                console.log("will handle later");
                return;
              }
            }}
            disabled={!newComment.trim()}
            className="absolute right-2 p-1.5 rounded-full bg-lime-500 text-white disabled:opacity-50
                        disabled:bg-gray-400 dark:disabled:bg-neutral-700 transition-all duration-200"
            aria-label="Send comment"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});
CommentsBox.propTypes = {
  post: PropTypes.object,
  setCommentTrayOpen: PropTypes.func,
  commentTrayOpen: PropTypes.bool,
};
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// ***************************************************
// import { useRef, useState, memo } from "react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useCollectionContext } from "../../contexts/CollectionContext";
import { useDarkModeContext } from "../../contexts/ThemeContext";

function getSettingsFromAlt(altText) {
  if ((altText.match(/#/g) || []).length !== 1) return {};

  const settingsPart = altText.split("#")[1];
  const result = {
    w: null,
    h: null,
    mt: null,
    mb: null,
    p: null,
  };

  // Match all settings with their values
  const regex = /(w|h|mt|mb)\.(\d+)|p\.([CSEcse])/g;
  let match;

  while ((match = regex.exec(settingsPart)) !== null) {
    const [_, key, value, pos] = match;

    if (key === "w" || key === "h") {
      const val = Math.min(parseInt(value), 678);
      if (!isNaN(val)) result[key] = val;
    } else if (key === "mt" || key === "mb") {
      const val = Math.min(parseInt(value), 100);
      if (!isNaN(val)) result[key] = val;
    } else if (pos) {
      result.p = pos.toUpperCase(); // Normalize to uppercase
    }
  }

  if (!result.p) return result;

  if (result.p.toLowerCase() === "c") {
    result.p = "center";
  } else if (result.p.toLowerCase() === "s") {
    result.p = "flex-start";
  } else if (result.p.toLowerCase() === "e") {
    result.p = "flex-end";
  } else {
    result.p = "center";
  }

  // console.log(result);
  return result;
}

/**
 * For now encode image properties inside alt text,
 * alt --> acctual alt text or empty # w.W,h.H,p.C,mt.MT,mb.MB
 * #-> special symbol for splitting,
 * w.WIDTH_VALUE_INT, eg w.230
 * for position -> (C-enter/S-tart/E-nd)
 * mb, mt -> max 100
 * w, h max 678
 */
const MarkdownImage = (props) => {
  const { src, alt, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { w, h, mt, mb, p } = getSettingsFromAlt(alt);

  return (
    <>
      {/* Inline image preview */}
      <div
        className="markdown-image-container-div relative cursor-zoom-in
        z-10 overflow-hidden flex items-center group"
        style={{
          justifyContent: p || `center`,
          marginTop: mt || `35px`,
          marginBottom: mb || `35px`,
        }}
        onClick={() => setIsOpen(true)}
      >
        <img
          className="relative object-contain transition-transform duration-300 border border-transparent group-hover:border-lime-300 _scale-[1.03]"
          style={{
            maxHeight: h || `468px`,
            maxWidth: w || `468px`,
          }}
          src={src}
          alt={alt}
          {...rest}
        />
      </div>

      {/* fullscreen modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
            aria-label="Close"
          >
            &times;
            {/* = &cross; */}
          </button>

          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain cursor-zoom-out"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};

MarkdownImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export const ThemedMarkdownPreview = memo(function ThemedMarkdownPreview({
  title,
  content,
  thumbnailUrl = null,
  isVisible = true,
  isDark = false,
  textAlignment = "left",
  lightModeBg = "bg-white",
  darkBg = "bg-[#222222]",
  artType = "written",
  darkTheme = null, // need a valid object, null will throw error
}) {
  if (!isVisible) return <></>;

  return (
    <div
      className={`w-full bg-white flex flex-col
        ${isDark ? `${darkBg} ${darkTheme.primaryText}` : lightModeBg}
        ${textAlignment === "center" ? "text-center" : "text-left"}`}
    >
      <div id="export" className="sentient-regular w-full">
        {/* title */}
        {title && (
          <div
            className={`pt-2 mb-10 leading-tight tracking-tight capitalize text-3xl md:text-4xl font-bold font-serif
              ${artType === "poem" ? "!max-w-[600px] !font-boskaBold" : ""}
              ${darkTheme.primaryText}`}
          >
            {title}
          </div>
        )}

        {/* thumbnail */}
        {thumbnailUrl && (
          <div
            className="relative mb-8 w-full _md:_w-[110%] _md:_transform _md:_translate-x-[-5%]
              __max-h-[370px] _bg-gray-200 _dark:_bg-[#171717]
              rounded-lg overflow-hidden shadow-none flex items-center justify-center bg-transparent"
          >
            <img
              src={thumbnailUrl}
              alt={title || "Article thumbnail"}
              className="aspect-video object-contain w-full"
              loading="lazy"
            />
          </div>
        )}

        {/* markdown content */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            img: MarkdownImage,

            hr: (props) => (
              <hr
                className={`my-6 border-t ${isDark ? `${darkTheme.border}` : "border-neutral-200"}`}
                {...props}
              />
            ),

            code: ({ inline, className, children, ...props }) => (
              <CodeBlock
                isDark={isDark}
                inline={inline}
                className={className}
                {...props}
              >
                {children}
              </CodeBlock>
            ),

            // blockquote styles are fixed in app.css
            blockquote: ({ children }) => (
              <blockquote
                className={`italic border-l-4 pl-4 py-1 my-3
                    ${isDark ? "border-[#999] bg-[#999]/0 text-[#ddd]" : "border-gray-400 bg-gray-100/0 text-gray-700"}`}
              >
                {children}
              </blockquote>
            ),

            h1: ({ children }) => (
              <h1
                id={generateId(children)}
                className={`mt-12 mb-6 leading-tight tracking-tight text-3xl md:text-4xl font-bold font-serif flex items-center gap-2 justify-start`}
              >
                {children}{" "}
                <Link
                  onClick={() => {
                    copyHeaderLink(children);
                  }}
                />
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                id={generateId(children)}
                className={`font-serif mt-10 mb-5 leading-tight tracking-tight text-2xl md:text-3xl font-bold flex items-center gap-2 justify-start`}
              >
                {children}{" "}
                <Link
                  onClick={() => {
                    copyHeaderLink(children);
                  }}
                />
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                id={generateId(children)}
                className={`font-serif mt-8 mb-4 leading-snug text-xl md:text-2xl font-bold flex items-center gap-2 justify-start`}
              >
                {children}{" "}
                <Link
                  onClick={() => {
                    copyHeaderLink(children);
                  }}
                />
              </h3>
            ),
            h4: ({ children }) => (
              <h4
                id={generateId(children)}
                className={`sentient-regular font-semibold mt-6 mb-3 leading-snug text-lg md:text-xl flex items-center gap-2 justify-start`}
              >
                {children}{" "}
                <Link
                  onClick={() => {
                    copyHeaderLink(children);
                  }}
                />
              </h4>
            ),
            h5: ({ children }) => (
              <h5
                className={`sentient-regular font-semibold mt-5 mb-3 leading-snug text-base md:text-lg`}
              >
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6
                className={`sentient-regular font-semibold mt-4 mb-2 uppercase tracking-wider text-base`}
              >
                {children}
              </h6>
            ),

            p: ({ children }) => (
              <p
                className={`my-8 w-full text-base md:text-lg md:leading-[28px] ${darkTheme.secondaryText}
                    ${artType === "poem" ? "font-serif md:font-boskaLight text-base md:text-xl leading-[28px] md:leading-[32px] !my-0" : ""}`}
              >
                {/* initially it was : leading-[40px] */}
                {children}
              </p>
            ),

            strong: ({ children }) => (
              <strong
                className={`font-semibold sentient-bold ${darkTheme.secondaryText}`}
              >
                {children}
              </strong>
            ),

            em: ({ children }) => (
              <em
                className={`italic ${darkTheme.secondaryText} ${artType === "poem" ? "font-boska" : "sentient-italic"}`}
              >
                {children}
              </em>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                className={`border-b border-current pb-0.5 font-medium sentient-regular transition-colors duration-200 ${
                  isDark
                    ? "text-blue-300 hover:text-blue-400"
                    : "text-blue-600 hover:text-blue-800"
                }`}
                target={href.startsWith("http") ? "_blank" : "_self"}
                rel={href.startsWith("http") ? "noopener noreferrer" : ""}
              >
                {children}
              </a>
            ),

            ul: ({ children }) => (
              <ul
                className={`sentient-regular ${darkTheme.secondaryText} list-disc pl-6 md:pl-8 my-3 md:my-4 space-y-4`}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                className={`sentient-regular ${darkTheme.secondaryText} list-decimal pl-6 md:pl-8 my-3 md:my-4 space-y-4`}
              >
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li
                className={`sentient-regular ${darkTheme.secondaryText} leading-snug md:leading-normal text-base md:text-lg`}
              >
                {children}
              </li>
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table
                  className={`border border-gray-400 ${darkTheme.table.border} bg-white ${darkTheme.table.rowBg} w-full text-neutral-900 ${darkTheme.primaryText}`}
                >
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className={`bg-gray-200 ${darkTheme.table.headerBg}`}>
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className={`${darkTheme.table.rowBg}`}>{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr
                className={`border border-gray-300 ${darkTheme.table.border}`}
              >
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th
                className={`border sentient-bold border-gray-300 ${darkTheme.table.border} px-4 py-2 bg-gray-100 ${darkTheme.table.headerBg}`}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className={`border border-gray-300 ${darkTheme.table.border} ${darkTheme.secondaryText} px-4 py-2 ${darkTheme.table.rowBg} sentient-regular`}
              >
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="bg-transparent h-[15vh]" />
    </div>
  );
});

ThemedMarkdownPreview.propTypes = {
  title: PropTypes.any,
  content: PropTypes.any,
  thumbnailUrl: PropTypes.any,
  isVisible: PropTypes.bool,
  isDark: PropTypes.bool,
  textAlignment: PropTypes.string,
  lightModeBg: PropTypes.string,
  darkBg: PropTypes.string,
  artType: PropTypes.string,
  darkTheme: PropTypes.object,
};
