// client/src/pages/PostView/components.jsx

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
import { slugify } from "@/pages/Create/Editor/hooks/useWritingPad";

// ::::: Helpers :::::

// Share post URL — uses proper slug so links are human-readable
function sharePost(post) {
  const slug = `${slugify(post.title)}-${post._id}`;
  const postUrl = `${window.location.origin}/p/${slug}`;

  navigator.clipboard
    .writeText(postUrl)
    .then(() => toast.success("Link copied to clipboard"))
    .catch((err) => {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    });
}

// Safe ISO date string — guards against undefined/null/invalid dates
function toISOStringSafe(date) {
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ::::: PostHelmet :::::

export const PostHelmet = ({ post, author }) => {
  const slug = `${slugify(post.title)}-${post._id}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [`${window.location.origin}${post.thumbnailUrl}`],
    datePublished: toISOStringSafe(post.createdAt),
    dateModified: toISOStringSafe(post.updatedAt), // model uses updatedAt, not modifiedAt
    author: {
      "@type": "Person",
      name: author.fullName,
    },
    publisher: {
      "@type": "Organization",
      name: "Opencanvas",
      logo: {
        "@type": "ImageObject",
        url: "https://opencanvas.institute/logo.png",
      },
    },
    description: post.title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${window.location.origin}/p/${slug}`,
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

export const LoadingPost = () => {
  return (
    <div className="flex justify-center items-center h-screen text-black dark:text-white">
      Loading post...
    </div>
  );
};

export const NotPost = () => {
  const navigate = useNavigate();
  return (
    <div className="">
      <Header />
      <div className="flex text-base flex-col justify-center items-center h-screen text-black dark:text-white gap-3">
        Post not found
        <button
          className="rounded-md text-sm bg-cream hover:bg-cream-dark box-content px-2 py-1 text-stone-600/80 flex items-center justify-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-6" />
          Go Back
        </button>
      </div>
    </div>
  );
};

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
  const list = Array.from({ length: 0 }, (_, i) => i);

  return (
    <>
      <div className="md:hidden w-full fixed bottom-0 dark:text-white">
        <Drawer>
          {list?.length > 0 && (
            <DrawerTrigger className="bg-lime-300 w-full py-2 rounded-t-xl z-[50000]">
              serial num. Short title of current article
              <br />
              Lorem ipsum dolor sit amet.
            </DrawerTrigger>
          )}
          <DrawerContent className="max-h-[60vh] flex flex-col">
            {list?.length > 0 && (
              <DrawerHeader>
                <DrawerTitle>Collection Name</DrawerTitle>
              </DrawerHeader>
            )}
            <div className="px-4 py-2 overflow-y-auto flex-1">
              {list.map((index) => (
                <div
                  key={index}
                  className={`px-2 py-4 rounded hover:bg-gray-100 dark:hover:bg-[#222] transition duration-0
                  font-thin text-sm leading-tight border-b border-dashed
                  ${index === 2 && "bg-lime-100 hover:bg-lime-100"}`}
                >
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
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
        className={`relative w-full md:w-72 px-4 py-6 hidden md:flex flex-col md:mr-4`}
      >
        <div className="dark:text-white">
          {list?.length > 0 && <div className="mb-4 pl-2">Collection Name</div>}
          <div className="max-h-screen overflow-y-auto no-scrollbar">
            {list.map((index) => (
              <div
                key={index}
                className={`pl-2 py-4 rounded hover:bg-gray-100 dark:hover:bg-[#333] transition duration-0
                  text-sm leading-tight border-b border-dashed border-neutral-400 dark:border-neutral-700 dark:text-neutral-200
                  ${index === 2 && "bg-lime-100 dark:bg-[#333] hover:bg-lime-100 dark:hover:bg-[#333]"}`}
              >
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              </div>
            ))}
          </div>
        </div>
        <div className=""></div>
      </aside>
    </>
  );
};

export const TableOfContents = memo(function Toc({
  tableOfContents,
  isArticle,
}) {
  const [isOpen, setIsOpen] = useState(!true);

  return (
    <aside className="w-full h-full lg:w-72 relative">
      {isArticle && (
        <div className="fixed top-20 lg:top-24 right-4 lg:right-16 2xl:right-16 w-52 lg:w-72 2xl:w-[400px] px-0 no-scrollbar">
          <summary
            className="flex items-center justify-start gap-1 py-2 cursor-pointer list-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="hidden lg:block font-serif text-xl px-2 bg-lime-200 dark:bg-neutral-700 rounded text-black dark:text-[#f8f8f8]">
              Table of Contents
            </div>
            <div className="hidden lg:block dark:text-neutral-500">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
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
                        <summary className="list-none text-sm text-neutral-500 dark:text-neutral-300 cursor-pointer" />
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
  // Strip triple-backtick code blocks so headings inside them aren't parsed
  content = content?.replace(/```[\s\S]*?```/g, "");

  const parseTableOfContents = (content) => {
    if (!content) return [];

    const lines = content.split("\n");
    const tableOfContents = [];
    let currentTitle = null;
    let currentHeading = null;
    let currentSubheading = null;

    for (const line of lines) {
      if (line.startsWith("# ")) {
        const text = line.substring(2).trim();
        const id = generateId(text);
        currentTitle = { text, id, headings: [] };
        tableOfContents.push(currentTitle);
        currentHeading = null;
        currentSubheading = null;
      } else if (line.startsWith("## ")) {
        const text = line.substring(3).trim();
        const id = generateId(text);
        currentHeading = { text, id, subheadings: [] };
        if (!currentTitle) {
          currentTitle = { text: "", id: "", headings: [] };
          tableOfContents.push(currentTitle);
        }
        currentTitle.headings.push(currentHeading);
        currentSubheading = null;
      } else if (line.startsWith("### ")) {
        const text = line.substring(4).trim();
        const id = generateId(text);
        currentSubheading = { text, id, h4s: [] };
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
      } else if (line.startsWith("#### ")) {
        const text = line.substring(5).trim();
        const id = generateId(text);
        const h4 = { text, id };
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
    <div className="md:ml-4">
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
  const { darkMode: isDark, setDarkTheme: setDark } = useDarkModeContext();

  const handleThemeChange = (themeKey) => {
    if (!isDark) setDark(true);
    if (themeKey === "light" && isDark) setDark(false);
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
    return new Date(dt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div
      className="w-full flex flex-col md:flex-row items-start md:items-center justify-between
      space-y-2 md:space-y-0 mb-10 md:mb-8"
    >
      <div className="flex justify-center items-center gap-2">
        {/* back button */}
        <button
          className="rounded-full text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#111]
              border box-content p-1 text-stone-600/80 dark:border-[#333] cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* author info */}
        <div
          className="flex items-center cursor-pointer mr-12"
          onClick={() => navigate(`/u/${author.username}`)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage
              src={author.profilePicture || post.author?.profilePicture}
              alt={author.fullName || "U"}
            />
            <AvatarFallback className="bg-gradient-to-r from-lime-500 to-green-500 text-white font-stardom">
              {author.fullName?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div
              className={`font-medium flex items-center justify-start gap-2 ${darkTheme.colors.primaryText}`}
            >
              {author.fullName || post.author?.name || "not found"}
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
            <div className="text-sm text-gray-500 dark:text-gray-300">
              {author.designation}
            </div>
          </div>
        </div>
      </div>

      {/* post meta + actions */}
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
          <span className="w-px h-[15px] dark:bg-[#ccc]/60 bg-[#444]/60" />
          <BookMarked
            className="size-4 cursor-pointer rounded px-2 py-1 box-content
                hover:bg-gray-100 dark:hover:bg-[#333] text-black dark:text-white"
            onClick={() => setPostIdToSave(post._id)}
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
          <span>{post.stats.viewsCount}</span>
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
          <span>{post.stats.commentsCount}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPostIdToSave(post._id)}
        >
          <BookMarked className="size-4" />
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

// ::::: Comment (single comment row) :::::
//
// Uses `comment.authorSnapshot` (denormalized on the Comment model - no populate needed).
// Uses `comment.parentId` to detect replies (replaces the old `comment.isReply` flag).
// Uses `comment.updatedAt !== comment.createdAt` to detect edits (replaces `modifiedAt`).
// Uses `comment.stats.repliesCount` for the reply count (replaces `comment.replies.length`).

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
  replyingToUsername, // username string of the parent comment author, passed in for replies
}) => {
  const navigate = useNavigate();

  const author = comment.authorSnapshot; // { username, profilePicture }
  const isOwnComment =
    comment?.authorId?.toString() === currentUser?._id?.toString();
  const isPostAuthor =
    comment?.authorId?.toString() === post?.authorId?.toString();
  const isEdited = comment?.updatedAt !== comment?.createdAt;
  const isReply = !!comment.parentId; // top-level comments have parentId: null

  return (
    <div className="flex space-x-3 py-3 group text-wrap">
      <Avatar
        onClick={() => navigate(`/u/${author.username}`)}
        className="size-6 rounded-full flex-shrink-0 cursor-pointer"
      >
        <AvatarImage src={author.profilePicture} alt={author.username} />
        <AvatarFallback className="font-thin">
          {author.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-3">
            {author.username}
            <div className="flex items-center justify-center gap-2">
              {/* Edit/delete only shown to the comment's own author */}
              {isOwnComment && (
                <>
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
              {/* Reply button only on top-level comments */}
              {!isReply && (
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

        {isPostAuthor && (
          <span className="bg-lime-200 dark:bg-lime-700 rounded-full px-2 text-xs mr-2">
            Author
          </span>
        )}
        {isEdited && (
          <span className="bg-gray-200 dark:bg-neutral-700 rounded-full px-2 text-xs">
            edited
          </span>
        )}

        <p className="mt-1 text-gray-800 dark:text-neutral-200 text-wrap break-words max-w-72 text-sm font-light">
          {/* Show @mention prefix for reply comments */}
          {replyingToUsername && (
            <span className="font-semibold">@{replyingToUsername} </span>
          )}
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
  replyingToUsername: PropTypes.string,
  setIsEditing: PropTypes.func,
  editingCommentRef: PropTypes.object,
  setIsReplying: PropTypes.func,
  parentCommentRef: PropTypes.object,
  setNewComment: PropTypes.func,
  handleDelete: PropTypes.func,
};

// ::::: CommentsBox :::::
//
// Loads top-level comments via GET /p/:postId/comments (new route).
// Replies are loaded on-demand when the user clicks the reply count.
// All handler calls now match the dataService signatures:
//   addComment(postId, content)
//   editComment(commentId, content)
//   replyToComment(postId, parentId, content)
//   deleteComment(commentId)
//   getComment(commentId) → { comment, replies }

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

  // replies: [{ parentCommentId, replies: Comment[] }]
  // Populated lazily when the user expands a comment's replies.
  const [replies, setReplies] = useState([]);

  // Track which comments have their replies expanded
  const [expandedReplies, setExpandedReplies] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);
  const editingCommentRef = useRef(null); // the comment currently being edited
  const parentCommentRef = useRef(null); // the comment being replied to

  const {
    getPostComments,
    getComment,
    addComment,
    editComment,
    deleteComment,
    replyToComment,
  } = useDataService();

  // ::::: Helpers :::::

  // Returns fetched replies for a given comment, or false if not yet loaded
  function getFetchedReplies(commentId) {
    return (
      replies.find((r) => r.parentCommentId.toString() === commentId.toString())
        ?.replies || false
    );
  }

  function isReplyExpanded(commentId) {
    return expandedReplies.includes(commentId.toString());
  }

  // ::::: Load comments on mount :::::

  useEffect(() => {
    async function loadComments() {
      setLoading(true);
      try {
        const data = await getPostComments(post._id);
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [post._id]);

  // Scroll to bottom when new comments arrive and tray is open
  useEffect(() => {
    if (commentTrayOpen && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, commentTrayOpen]);

  // Focus input when tray opens
  useEffect(() => {
    if (commentTrayOpen && inputRef.current) inputRef.current.focus();
  }, [commentTrayOpen]);

  // ::::: Handlers :::::

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }
    const content = newComment.trim();
    if (!content) return toast.error("Comment cannot be empty");

    setLoading(true);
    try {
      const comment = await addComment(post._id, content); // addComment(postId, content)
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e, commentId) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }
    const content = newComment.trim();
    if (!content) return toast.error("Comment cannot be empty");

    setLoading(true);
    try {
      const updated = await editComment(commentId, content); // editComment(commentId, content)

      if (editingCommentRef.current?.parentId) {
        // It's a reply - update inside the replies list
        const parentId = editingCommentRef.current.parentId.toString();
        setReplies((prev) =>
          prev.map((r) =>
            r.parentCommentId.toString() === parentId
              ? {
                  ...r,
                  replies: r.replies.map((reply) =>
                    reply._id.toString() === commentId.toString()
                      ? updated
                      : reply,
                  ),
                }
              : r,
          ),
        );
      } else {
        // Top-level comment
        setComments((prev) =>
          prev.map((c) =>
            c._id.toString() === commentId.toString() ? updated : c,
          ),
        );
      }

      setNewComment("");
      editingCommentRef.current = null;
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
      setLoading(false);
    }
  };

  const handleDelete = async (e, commentId) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.filter((c) => c._id.toString() !== commentId.toString()),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e, postId, parentId) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You need to login first.");
      localStorage.setItem("urlToRedirectAfterLogin", window.location.pathname);
      navigate("/login-needed");
      return;
    }
    const content = newComment.trim();
    if (!content) return toast.error("Reply cannot be empty");

    setLoading(true);
    try {
      // replyToComment(postId, parentId, content)
      const reply = await replyToComment(postId, parentId, content);

      // Optimistically increment the reply count on the parent comment
      setComments((prev) =>
        prev.map((c) =>
          c._id.toString() === parentId.toString()
            ? {
                ...c,
                stats: {
                  ...c.stats,
                  repliesCount: (c.stats.repliesCount || 0) + 1,
                },
              }
            : c,
        ),
      );

      // If replies are already expanded for this parent, append the new reply
      if (isReplyExpanded(parentId)) {
        setReplies((prev) =>
          prev.map((r) =>
            r.parentCommentId.toString() === parentId.toString()
              ? { ...r, replies: [...r.replies, reply] }
              : r,
          ),
        );
      }

      setNewComment("");
      parentCommentRef.current = null;
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
      setLoading(false);
    }
  };

  // Load replies for a comment on demand (called when user clicks the reply count)
  const loadReplies = async (commentId) => {
    setLoading(true);
    try {
      const { replies: fetched } = await getComment(commentId); // returns { comment, replies }
      setReplies((prev) => [
        ...prev.filter(
          (r) => r.parentCommentId.toString() !== commentId.toString(),
        ),
        { parentCommentId: commentId, replies: fetched },
      ]);
      setExpandedReplies((prev) => [...prev, commentId.toString()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const collapseReplies = (commentId) => {
    setExpandedReplies((prev) =>
      prev.filter((id) => id !== commentId.toString()),
    );
  };

  // ::::: Render :::::

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out
        ${commentTrayOpen ? "translate-x-0" : "translate-x-full"} flex flex-col h-full z-50`}
    >
      {/* Header */}
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

      {loading && (
        <div className="absolute left-0 w-full h-screen flex items-center justify-center">
          <div className="loader z-40" />
        </div>
      )}

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y-[1px]">
        {comments.length > 0
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

                {/* Show/hide replies toggle - uses stats.repliesCount from the model */}
                {comment.stats.repliesCount > 0 &&
                  !isReplyExpanded(comment._id) && (
                    <div
                      onClick={() => loadReplies(comment._id)}
                      className="flex items-center justify-start gap-2 pl-6 text-neutral-600 dark:text-neutral-400 text-sm mt-2 cursor-pointer"
                    >
                      <PlusCircle size={16} />
                      {comment.stats.repliesCount}{" "}
                      {comment.stats.repliesCount === 1 ? "reply" : "replies"}
                    </div>
                  )}
                {comment.stats.repliesCount > 0 &&
                  isReplyExpanded(comment._id) && (
                    <div
                      onClick={() => collapseReplies(comment._id)}
                      className="flex items-center justify-start gap-2 pl-8 text-neutral-600 dark:text-neutral-400 text-sm mt-2 cursor-pointer"
                    >
                      <MinusCircle size={16} />
                      {comment.stats.repliesCount} replies
                    </div>
                  )}

                {/* Expanded replies */}
                <div className="pl-8">
                  {isReplyExpanded(comment._id) &&
                    getFetchedReplies(comment._id) &&
                    getFetchedReplies(comment._id).map((reply) => (
                      <Comment
                        key={reply._id}
                        comment={reply}
                        currentUser={currentUser}
                        post={post}
                        setIsEditing={setIsEditing}
                        editingCommentRef={editingCommentRef}
                        setIsReplying={setIsReplying}
                        parentCommentRef={parentCommentRef}
                        setNewComment={setNewComment}
                        handleDelete={handleDelete}
                        replyingToUsername={comment.authorSnapshot.username}
                      />
                    ))}
                </div>
              </div>
            ))
          : "No comments yet"}
        <div ref={commentsEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
        {isEditing && (
          <div className="dark:text-white px-2 pb-4 pt-0 text-sm w-full flex items-center justify-between">
            Editing
            <X
              className="cursor-pointer"
              size={16}
              onClick={() => {
                setIsEditing(false);
                editingCommentRef.current = null;
                setNewComment("");
              }}
            />
          </div>
        )}
        {isReplying && (
          <div className="dark:text-white px-2 pb-4 pt-0 text-sm w-full flex items-center justify-between">
            <span>
              Replying to{" "}
              <u>@{parentCommentRef.current?.authorSnapshot.username}</u>
            </span>
            <X
              className="cursor-pointer"
              size={16}
              onClick={() => {
                setIsReplying(false);
                parentCommentRef.current = null;
                setNewComment("");
              }}
            />
          </div>
        )}
        <div className="relative flex items-center">
          <textarea
            rows={1}
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 pr-10 bg-gray-100 dark:bg-neutral-800 border-0 rounded-full text-gray-800 dark:text-neutral-100 no-resize no-scrollbar
              placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-200"
          />
          <button
            onClick={(e) => {
              if (isEditing && !isReplying)
                handleEdit(e, editingCommentRef.current._id);
              else if (isReplying && !isEditing)
                handleReply(e, post._id, parentCommentRef.current._id);
              else handleSubmit(e);
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

// ::::: Markdown Preview :::::

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useCollectionContext } from "../../contexts/CollectionContext";
import { useDarkModeContext } from "../../contexts/ThemeContext";

// Parse image layout settings from alt text
// Format: "actual alt text # w.WIDTH h.HEIGHT p.POSITION mt.TOP mb.BOTTOM"
function getSettingsFromAlt(altText) {
  if ((altText.match(/#/g) || []).length !== 1) return {};

  const settingsPart = altText.split("#")[1];
  const result = { w: null, h: null, mt: null, mb: null, p: null };
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
      result.p = pos.toUpperCase();
    }
  }

  if (!result.p) return result;
  if (result.p === "C") result.p = "center";
  else if (result.p === "S") result.p = "flex-start";
  else if (result.p === "E") result.p = "flex-end";
  else result.p = "center";

  return result;
}

const MarkdownImage = (props) => {
  const { src, alt = "", ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { w, h, mt, mb, p } = getSettingsFromAlt(alt);

  return (
    <>
      <div
        className="markdown-image-container-div relative cursor-zoom-in z-10 overflow-hidden flex items-center group"
        style={{
          justifyContent: p || "center",
          marginTop: mt || "35px",
          marginBottom: mb || "35px",
        }}
        onClick={() => setIsOpen(true)}
      >
        <img
          className="relative object-contain transition-transform duration-300 border border-transparent group-hover:border-lime-300"
          style={{ maxHeight: h || "468px", maxWidth: w || "468px" }}
          src={src}
          alt={alt}
          {...rest}
        />
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
            aria-label="Close"
          >
            &times;
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
  darkTheme = null,
}) {
  if (!isVisible) return <></>;

  return (
    <div
      className={`w-full bg-white flex flex-col
        ${isDark ? `${darkBg} ${darkTheme.primaryText}` : lightModeBg}
        ${textAlignment === "center" ? "text-center" : "text-left"}`}
    >
      <div id="export" className="sentient-regular w-full">
        {title && (
          <div
            className={`pt-2 mb-10 leading-tight tracking-tight capitalize text-3xl md:text-4xl font-bold font-serif
              ${artType === "poem" ? "!max-w-[600px] !font-boskaBold" : ""}
              ${darkTheme.primaryText}`}
          >
            {title}
          </div>
        )}

        {thumbnailUrl && (
          <div className="relative mb-8 w-full rounded-lg overflow-hidden shadow-none flex items-center justify-center bg-transparent">
            <img
              src={thumbnailUrl}
              alt={title || "Article thumbnail"}
              className="aspect-video object-contain w-full"
              loading="lazy"
            />
          </div>
        )}

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
            blockquote: ({ children }) => (
              <blockquote
                className={`italic border-l-4 pl-4 py-1 my-3
                  ${isDark ? "border-[#999] text-[#ddd]" : "border-gray-400 text-gray-700"}`}
              >
                {children}
              </blockquote>
            ),
            h1: ({ children }) => (
              <h1
                id={generateId(children)}
                className="mt-12 mb-6 leading-tight tracking-tight text-3xl md:text-4xl font-bold font-serif flex items-center gap-2 justify-start group"
              >
                {children}{" "}
                <Link
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => copyHeaderLink(children)}
                />
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                id={generateId(children)}
                className="font-serif mt-10 mb-5 leading-tight tracking-tight text-2xl md:text-3xl font-bold flex items-center gap-2 justify-start group"
              >
                {children}{" "}
                <Link
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => copyHeaderLink(children)}
                />
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                id={generateId(children)}
                className="font-serif mt-8 mb-4 leading-snug text-xl md:text-2xl font-bold flex items-center gap-2 justify-start group"
              >
                {children}{" "}
                <Link
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => copyHeaderLink(children)}
                />
              </h3>
            ),
            h4: ({ children }) => (
              <h4
                id={generateId(children)}
                className="sentient-regular font-semibold mt-6 mb-3 leading-snug text-lg md:text-xl flex items-center gap-2 justify-start group"
              >
                {children}{" "}
                <Link
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => copyHeaderLink(children)}
                />
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="sentient-regular font-semibold mt-5 mb-3 leading-snug text-base md:text-lg">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="sentient-regular font-semibold mt-4 mb-2 uppercase tracking-wider text-base">
                {children}
              </h6>
            ),
            p: ({ children }) => (
              <p
                className={`my-8 w-full text-base md:text-lg md:leading-[28px] ${darkTheme.secondaryText}
                  ${artType === "poem" ? "font-serif md:font-boskaLight text-base md:text-xl leading-[28px] md:leading-[32px] !my-0" : ""}`}
              >
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
                className={`underline font-medium sentient-regular transition-colors duration-200 ${
                  isDark
                    ? "text-lime-300 hover:text-lime-400"
                    : "text-lime-600 hover:text-lime-700"
                }`}
                target={href.startsWith("http") ? "_blank" : "_self"}
                rel={href.startsWith("http") ? "noopener noreferrer" : ""}
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul
                className={`sentient-regular ${darkTheme.secondaryText} list-disc pl-6 md:pl-8 my-3 md:my-4 space-y-1`}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                className={`sentient-regular ${darkTheme.secondaryText} list-decimal pl-6 md:pl-8 my-3 md:my-4 space-y-1`}
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
              <tbody className={darkTheme.table.rowBg}>{children}</tbody>
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
