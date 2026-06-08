import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { institutionBySlug } from "@/config/institutions";

export default function PublicationCard({ publication }) {
    const {
        _id,
        title,
        abstract,
        authors,
        institution,
        categories,
        publishedAt,
        stats,
        pdfUrl,
        externalUrl,
    } = publication;

    const instConfig = institutionBySlug[institution] || {
        displayName: institution,
        color: "#64748b",
    };

    const displayAuthors = authors
        .slice(0, 3)
        .map((a) => a.name)
        .join(", ");
    const authorSuffix =
        authors.length > 3 ? ` + ${authors.length - 3} more` : "";

    const formatNumber = (num) =>
        Intl.NumberFormat("en-US", { notation: "compact" }).format(num || 0);
    const formattedDate = new Date(publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <Card className="hover:bg-accent/10 transition-colors shadow-none border-none dark:hover:bg-inherit">
            <Link to={`/publications/${institution}/${_id}`}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <Badge
                            variant="outline"
                            style={{
                                borderColor: instConfig.color,
                                color: instConfig.color,
                            }}
                            className="whitespace-nowrap rounded-2xl font-light"
                        >
                            {instConfig.shortName || instConfig.displayName}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formattedDate}
                        </span>
                    </div>
                    <CardTitle className="text-xl leading-tight cursor-pointer font-sentient capitalize">
                        {title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 font-mono tracking-tight">
                        {displayAuthors}
                        {authorSuffix}
                    </p>
                </CardHeader>

                <CardContent className="pb-4">
                    <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed mb-4 font-sentient my-2.5">
                        {abstract || "No abstract available."}
                    </p>

                    {categories?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categories.slice(0, 4).map((cat, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Link>

            <CardFooter className="pt-0 flex justify-between items-center border-y border-dashed px-6 py-1.5 bg-muted/20">
                <div className="flex gap-4 text-sm text-muted-foreground">
                    {[
                        [stats?.viewsCount, "Views"],
                        [stats?.likesCount, "Likes"],
                        [stats?.savesCount, "Saves"],
                    ].map((itm, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-1.5 hover:text-foreground cursor-default transition-colors"
                        >
                            <span>
                                {formatNumber(itm[0])} {itm[1]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    {externalUrl && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="w-4 h-4 mr-0" />
                                Source
                            </a>
                        </Button>
                    )}
                    {pdfUrl && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="w-4 h-4 mr-0" />
                                PDF
                            </a>
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

PublicationCard.propTypes = {
    publication: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        abstract: PropTypes.string,
        authors: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                affiliation: PropTypes.string,
            }),
        ).isRequired,
        institution: PropTypes.string.isRequired,
        categories: PropTypes.arrayOf(PropTypes.string),
        publishedAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date),
        ]).isRequired,
        stats: PropTypes.shape({
            likesCount: PropTypes.number,
            commentsCount: PropTypes.number,
            savesCount: PropTypes.number,
            viewsCount: PropTypes.number,
            dislikesCount: PropTypes.number,
        }),
        pdfUrl: PropTypes.string,
        externalUrl: PropTypes.string,
    }).isRequired,
};
