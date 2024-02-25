export function guard_against_non_admins() {
  if (!globalThis.is_admin) {
     return ({path: '/'})
  }
}
