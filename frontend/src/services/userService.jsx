class UserService {
  getData(slug, time, flag) {
    const server_host =process.env.REACT_APP_SERVER_PATH ;

    var requestPayload = {slug:slug , flag:flag}
    if(time){
      requestPayload.time = time;
    }

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
      fetch(server_host + "/data/getData" , fetchPostOptions)
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          if (res) {
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
  
  saveData(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
    const server_host =process.env.REACT_APP_SERVER_PATH ;

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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/data/saveData/", fetchPostOptions)
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
  saveFile(formData) {
    // const host = process.env.REACT_APP_SERVER_PATH;
    const server_host =process.env.REACT_APP_SERVER_PATH ;

    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: "POST",
        credentials: "include",
        headers: {
          "Access-Control-Allow-Origin": "*",        
          "slug" : formData.get("slug"),
        },
        body: formData,
      };
      fetch(server_host + "/data/saveFile/", fetchPostOptions)
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
  removeFile(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
    const server_host =process.env.REACT_APP_SERVER_PATH ;

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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/data/removeFile/", fetchPostOptions)
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

  getUserPreferTheme() {
    const localData = localStorage.getItem("getUserPreferTheme");
    if (localData == null) {
      return "white";
    }
    return JSON.parse(localData);
  }
}

export default new UserService();
 