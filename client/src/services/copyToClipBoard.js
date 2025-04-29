import { toast } from "sonner";

export function copyHeaderLink(children) {
    const headingId = children
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const fullUrl = `${window.location.origin}${window.location.pathname}#${headingId}`;

    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied!");
}
