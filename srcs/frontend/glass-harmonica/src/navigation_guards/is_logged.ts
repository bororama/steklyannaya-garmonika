export function guard_against_not_logged(to, from) {
  if (globalThis.logToken == null)
    return ({path: '/'})
}
