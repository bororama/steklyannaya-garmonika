export function guard_against_match_exit(to, from, next) {
  if (to.fullPath == "/" && from.fullPath == "/pong_match" && globalThis.canExitMatch != true)
  {
    next(false)
  } else {
    next()
  }
}
