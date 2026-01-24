export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  login: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: User;
}
