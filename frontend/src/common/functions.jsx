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