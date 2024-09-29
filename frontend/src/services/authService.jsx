class AuthService {


    login(requestPayload) {


        const server_host = process.env.REACT_APP_SERVER_PATH;


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


        const server_host = process.env.REACT_APP_SERVER_PATH;


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
        const server_host = process.env.REACT_APP_SERVER_PATH;
    
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
    
}



export default new AuthService();
