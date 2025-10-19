var MAX_FILE_NAME_VISIBLE = 20;
export function generateRandomString(length) {
    const characters =
        "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}

export function isValidSlug(slug) {
    // Regular expression to match valid characters for a slug
    const slugRegex = /^[a-zA-Z0-9 _-]+$/;
    return slugRegex.test(slug) && slug.length > 1;
}

/**
 * Reserved route names that cannot be used as document slugs
 */
const RESERVED_ROUTE_NAMES = [
    'p', 't', 'auth', 'api', 'help', 'about', 'games', 'game',
    'admin', 'system', 'config', 'settings', 'dashboard', 'profile', 'user', 'users'
];

/**
 * Check if a slug is a reserved route name
 */
export function isReservedRouteName(slug) {
    if (!slug || typeof slug !== 'string') return false;
    const normalizedSlug = slug.toLowerCase().trim().replace(/[_\s-]/g, '');
    return RESERVED_ROUTE_NAMES.includes(normalizedSlug);
}

/**
 * Validate slug is both valid format AND not a reserved name
 */
export function isValidAndNotReservedSlug(slug) {
    return isValidSlug(slug) && !isReservedRouteName(slug);
}

export function getTimeInFormate(time) {
    let t = new Date(time);
    // Pad each component with leading zeros if necessary
    const year = t.getFullYear();
    const month = (t.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
    const day = t.getDate().toString().padStart(2, "0");
    const hours = t.getHours().toString().padStart(2, "0");
    const minutes = t.getMinutes().toString().padStart(2, "0");
    const seconds = t.getSeconds().toString().padStart(2, "0");
    // Construct the formatted time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getPresizeFileName(name) {
    if (name.length > MAX_FILE_NAME_VISIBLE) {
        return name.slice(0, MAX_FILE_NAME_VISIBLE) + "...";
    }
    return name;
}