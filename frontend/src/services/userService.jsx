
class UserService {
  getData(slug) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Method": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        }
      };
      fetch("http://localhost:8080/data/getData/"+slug, fetchPostOptions)
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((res) => {
          console.log("res  : " +res);
          if (res) {
            resolve(res);
          } else {
            reject(res.message);
          }
        })
        .catch((e) => {
          console.log("error : ", e);
          reject(e.toString());
        });
    });
  }
  saveData(data) {
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
      fetch("http://localhost:8080/data/saveData/", fetchPostOptions)
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
          console.log("error : ", e);
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
