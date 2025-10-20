import { handleRejectResponse } from './systemService'
import { getBackendUrl } from '../hooks/useConfig'

const getBackendURL = () => getBackendUrl()

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
        fetch(getBackendURL() + '/api/auction/login', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/public/get', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/get', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/create', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/update', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/team/create', fetchPostOptions)
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

  updateAuctionTeam(data) {
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
      fetch(getBackendURL() + '/api/auction/team/update', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/team/remove', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/player/create', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/player/remove', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/player/update', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/set/update', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/set/create', fetchPostOptions)
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
        fetch(getBackendURL() + '/api/auction/set/remove', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/dataImports', fetchPostOptions)
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

  saveTeamLogo(data) {
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
      fetch(getBackendURL() + '/api/auction/team/logo/upload', fetchPostOptions)
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
      fetch(getBackendURL() + '/api/auction/logout', fetchPostOptions)
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