export const backend = 'http://' + process.env.HOST + ':3000' /*'http://localhost:3000'*/

export const api_42 = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b16e1d817c759a4768523eda7110974f45570d769c4180e352137a7aeb4a5ee7&redirect_uri=http%3A%2F%2F' + process.env.HOST + '%3A5173&response_type=code'

export function postRequestParams() {
    return ({
      method: 'POST',
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + globalThis.logToken
      },
      body: JSON.stringify({})
  })
}

export function getRequestParams() {
  return ({
  
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + globalThis.logToken
  }
  })
}

export function deleteRequestParams() {
  return ({
    method: 'DELETE',
    mode: 'cors',
     headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + globalThis.logToken
    },
    body: JSON.stringify({})
  })
}
