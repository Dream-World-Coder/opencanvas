export function timeAgo(isoString) {
    const then = Date.parse(isoString);
    const now = Date.now();
    const seconds = Math.floor((now - then) / 1000);

    const units = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (let u in units) {
        const cnt = Math.floor(seconds / units[u]);
        if (cnt >= 1) return `${cnt} ${u}${cnt > 1 ? "s" : ""} ago`;
    }
    return "just now";
}

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function formatDateDetails(timestamp) {
    const date = new Date(timestamp);

    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day} ${hours}hr ${minutes}min`;
}
