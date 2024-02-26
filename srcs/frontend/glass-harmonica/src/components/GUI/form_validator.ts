export function check_alpha_numeric(candidate:string) {
   const regExp = /^([0-9]|[a-z])+([0-9a-z]+)$/i

   return (candidate.match(regExp))
}
