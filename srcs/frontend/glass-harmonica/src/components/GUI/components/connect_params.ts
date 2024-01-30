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
