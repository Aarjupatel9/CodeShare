import authService from "./authService";

export const  handleRejectResponse=(message)=> {
    console.log("handleRejectResponse called : ", message);
    if (message == "TokenExpiredError" || message == "JsonWebTokenError"|| message=="jwt expired") {
        console.log("handleRejectResponse called inside");
        authService.logout();
        window.location.reload();
        // checkLogin();
    }
}

