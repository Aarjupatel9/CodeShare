const server_host = process.env.REACT_APP_SERVER_PATH;

class AuthService {

    login(requestPayload) {
        return new Promise(function (resolve, reject) {
            const fetchPostOptions = {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Method": "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                },
                body: JSON.stringify(requestPayload)
            };
            fetch(server_host + "/api/auth/login", fetchPostOptions)
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.success) {
                        localStorage.setItem("currentUser", JSON.stringify(res.user))
                        resolve(res);
                    } else {
                        reject(res.message);
                    }
                })
                .catch((e) => {
                    console.error("error : ", e);
                    reject(e.toString());
                });
        });
    }

    register(requestPayload) {
        return new Promise(function (resolve, reject) {
            const fetchPostOptions = {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Method": "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                },
                body: JSON.stringify(requestPayload)
            };
            fetch(server_host + "/api/auth/register", fetchPostOptions)
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.success) {
                        resolve(res);
                    } else {
                        reject(res.message);
                    }
                })
                .catch((e) => {
                    console.error("error : ", e);
                    reject(e.toString());
                });
        });
    }

    forgetPassword(email) {
        return new Promise(function (resolve, reject) {
            const fetchPostOptions = {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Method": "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                },
                body: JSON.stringify({ email }) // Send the email in the body
            };
    
            fetch(server_host + "/api/auth/forgetpassword", fetchPostOptions)
                .then((response) => response.json())
                .then((res) => {
                    if (res.success) {
                        resolve(res); // Resolve with the successful response
                    } else {
                        reject(res.message); // Reject with the error message
                    }
                })
                .catch((e) => {
                    console.error("error : ", e);
                    reject(e.toString()); // Reject with the error string
                });
        });
    }

    checkLoggedInUser() {
        const currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null;
        if (currentUser) {
            return currentUser;
        } else {
            return false;
        }
    }
    
}



export default new AuthService();
