import { handleRejectResponse } from './systemService'
import { getBackendUrl } from '../hooks/useConfig'

const getBackendURL = () => getBackendUrl()

class UserService {

  getData(slug, time, flag, user) {
    var requestPayload = { slug: slug, flag: flag }
    requestPayload.userId = user ? user._id : null
    if (time) {
      requestPayload.time = time
    }

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
        body: JSON.stringify(requestPayload),
      }
      if (!user) {
        fetch(getBackendURL() + '/api/data/getData', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            reject(e.toString())
          })
      } else {
        fetch(getBackendURL() + '/api/data/p/getData', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (!res.success) {
              handleRejectResponse(res.message)
            }
            if (res) {
              resolve(res)
            } else {
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            handleRejectResponse(e.toString())
            reject(e.toString())
          })
      }
    })
  }

  saveData(data) {
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
        fetch(getBackendURL() + '/api/data/saveData/', fetchPostOptions)
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
      } else {
        fetch(getBackendURL() + '/api/data/p/saveData/', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              handleRejectResponse(res.message)
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            handleRejectResponse(e.toString())
            reject(e.toString())
          })
      }
    })
  }

  saveFile(formData) {
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
      fetch(getBackendURL() + '/api/data/p/saveFile/', fetchPostOptions)
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

  removeFile(data) {
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
      if (!data.currUser) {
        fetch(getBackendURL() + '/api/data/removeFile/', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              handleRejectResponse(res.message)
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            handleRejectResponse(e.toString())
            reject(e.toString())
          })
      } else {
        fetch(getBackendURL() + '/api/data/p/removeFile/', fetchPostOptions)
          .then((response) => {
            return response.json()
          })
          .then((res) => {
            if (res.success) {
              resolve(res)
            } else {
              handleRejectResponse(res.message)
              reject(res.message)
            }
          })
          .catch((e) => {
            console.error('error : ', e)
            handleRejectResponse(e.toString())
            reject(e.toString())
          })
      }
    })
  }

  removePage(data) {
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

      fetch(getBackendURL() + '/api/data/p/removePage', fetchPostOptions)
        .then((response) => {
          return response.json()
        })
        .then((res) => {
          if (res.success) {
            resolve(res)
          } else {
            handleRejectResponse(res.message)
            reject(res.message)
          }
        })
        .catch((e) => {
          console.error('error : ', e)
          handleRejectResponse(e.toString())
          reject(e.toString())
        })
    })
  }

  getUserPreferTheme() {
    const localData = localStorage.getItem('getUserPreferTheme')
    if (localData == null) {
      return 'white'
    }
    return JSON.parse(localData)
  }
}

export default new UserService()
