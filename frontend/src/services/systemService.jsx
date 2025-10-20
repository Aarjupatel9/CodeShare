import authService from "./authService";
import toast from 'react-hot-toast';

export const handleRejectResponse = (message) => {
    if (message == "TokenExpiredError" || message == "JsonWebTokenError" || message == "jwt expired" || message.toString().includes("token expired")) {
        toast.error("Your session has expired. Please login again to continue.", { duration: 4000 });
        authService.logout();
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 1000);
    }
}

