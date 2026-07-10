export const formatDisplayText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;

    const text = String(value).trim();
    if (!text) return fallback;

    return text
        .replace(/\s+/g, " ")
        .split(" ")
        .map((word) => {
            if (!word) return word;

            const hasHyphen = word.includes("-");
            if (hasHyphen) {
                return word
                    .split("-")
                    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
                    .join("-");
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};
