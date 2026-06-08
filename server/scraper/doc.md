scraper/
  index.js                 # entry point
  sources/
    arxiv.js               # arXiv Atom API
    oai_pmh.js             # OAI-PMH protocol (many universities support this)
    semantic_scholar.js    # Semantic Scholar API (free, great coverage)
    crossref.js            # CrossRef API (DOI-based, great coverage)
    website.js             # Cheerio-based custom scrapers
  config/
    institutions.js        # master list
  utils/
    normalize.js           # normalize to Publication shape
    db.js                  # mongoose connect/disconnect
    logger.js              # simple logger
    retry.js               # retry utility
