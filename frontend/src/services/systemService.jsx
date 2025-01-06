import authService from "./authService";

export const handleRejectResponse = (message) => {
    if (message == "TokenExpiredError" || message == "JsonWebTokenError" || message == "jwt expired") {
        authService.logout();
        window.location.reload();
    }
}

