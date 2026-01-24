export function getAuth() {
  const token = localStorage.getItem("token");
  const usuarioRaw = localStorage.getItem("usuario");

  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

  return { token, usuario, isAuthenticated: !!token };
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
