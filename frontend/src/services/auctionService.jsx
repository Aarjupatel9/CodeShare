import { handleRejectResponse } from "./systemService";


class AuctionService {


  getAuction(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/login", fetchPostOptions)
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
      }
    });

  }

  getPublicAuctionDetails(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/public/get", fetchPostOptions)
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
      }
    });
  }

  getAuctionDetails(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/get", fetchPostOptions)
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
      }
    });
  }

  createAuction(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/create", fetchPostOptions)
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
      }
    });
  }

  updateAuction(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/update", fetchPostOptions)
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

  createAuctionTeam(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/team/create", fetchPostOptions)
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
  removeAuctionTeam(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/team/remove", fetchPostOptions)
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


  createAuctionPlayer(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/player/create", fetchPostOptions)
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
  removeAuctionPlayer(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/player/remove", fetchPostOptions)
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
  updateAuctionPlayer(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/player/update", fetchPostOptions)
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


  updateAuctionSet(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/set/update", fetchPostOptions)
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
      }
    });
  }

  createAuctionSet(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/set/create", fetchPostOptions)
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
      }
    });
  }
  removeAuctionSet(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      if (!data.owner) {
        fetch(server_host + "/api/auction/set/remove", fetchPostOptions)
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
      }
    });
  }
  auctionDataImports(data) {
    // const host = process.env.REACT_APP_SERVER_PATH;
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
        body: JSON.stringify(data),
      };
      fetch(server_host + "/api/auction/dataImports", fetchPostOptions)
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

}

export default new AuctionService();