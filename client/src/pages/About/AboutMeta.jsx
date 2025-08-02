import { Helmet } from "react-helmet-async";

const AboutMeta = () => {
  return (
    <Helmet>
      {/* basic SEO */}
      <title>About OpenCanvas - A Home for Free Artistic Expression</title>
      <meta
        name="description"
        content="OpenCanvas is a creative platform for writers and artists to freely express their thoughts through poems, stories, articles, and more. Join a vibrant community of dreamers."
      />
      <meta
        name="keywords"
        content="writing, poetry, stories, articles, creative platform, open expression, artistic community"
      />
      <meta name="author" content="Subhajit Gorai" />
      <meta name="robots" content="index, follow" />

      {/* OG */}
      <meta
        property="og:title"
        content="About OpenCanvas - A Home for Free Artistic Expression"
      />
      <meta
        property="og:description"
        content="Share your poems, articles, and stories in an open and expressive platform. Connect with a like-minded creative community."
      />
      <meta
        property="og:image"
        content="https://opencanvas.blog/social-preview.png"
      />
      <meta property="og:url" content="https://opencanvas.blog/about" />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="About OpenCanvas - A Home for Free Artistic Expression"
      />
      <meta
        name="twitter:description"
        content="Explore a world of creativity where words flow freely. Poems, articles, and stories – all in one expressive platform."
      />
      <meta
        name="twitter:image"
        content="https://opencanvas.blog/social-preview.png"
      />
      <meta name="twitter:site" content="@opencanvas" />

      {/* canonical */}
      <link rel="canonical" href="https://opencanvas.blog/about" />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "OpenCanvas",
          url: "https://opencanvas.blog",
          description:
            "OpenCanvas is a creative platform where writers and artists freely express their thoughts through poems, stories, articles, and more. Join a vibrant community of dreamers.",
          image: "https://opencanvas.blog/social-preview.png",
          author: {
            "@type": "Organization",
            name: "OpenCanvas",
            url: "https://opencanvas.blog/about",
          },
          publisher: {
            "@type": "Organization",
            name: "OpenCanvas",
            url: "https://opencanvas.blog",
            logo: {
              "@type": "ImageObject",
              url: "https://opencanvas.blog/logo.png",
            },
          },
          sameAs: [
            "https://twitter.com/opencanvas",
            "https://www.instagram.com/opencanvas",
            "https://www.linkedin.com/company/opencanvas",
          ],
        })}
      </script>
    </Helmet>
  );
};

export default AboutMeta;
