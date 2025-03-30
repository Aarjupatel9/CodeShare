import { handleRejectResponse } from './systemService'
const backend_url = (await (await fetch('/config.json')).json()).backend_url

class AuctionService {
  getAuction(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/login', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  getPublicAuctionDetails(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/public/get', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  getAuctionDetails(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/get', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  createAuction(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/create', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  updateAuction(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/update', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  createAuctionTeam(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/team/create', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  removeAuctionTeam(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/team/remove', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  createAuctionPlayer(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/player/create', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  removeAuctionPlayer(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/player/remove', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  updateAuctionPlayer(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/player/update', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  updateAuctionSet(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/set/update', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  createAuctionSet(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/set/create', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  removeAuctionSet(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      if (!data.owner) {
        fetch(backend_url + '/api/auction/set/remove', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      }
    })
  }

  auctionDataImports(data) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Method': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify(data),
      }
      fetch(backend_url + '/api/auction/dataImports', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  saveTeamLogo(formData) {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': '*',
          slug: formData.get('slug'),
          filesize: formData.get('fileSize'),
        },
        body: formData,
      }
      fetch(backend_url + '/api/auction/team/logo', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }

  auctionLogout() {
    return new Promise(function (resolve, reject) {
      const fetchPostOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
      fetch(backend_url + '/api/auction/logout', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          reject(e.toString())
        })
    })
  }
}

export default new AuctionService();