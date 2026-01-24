import { httpClient } from "@/lib/http/axios";
import type { LoginPayload, LoginResponse } from "../types";


export const authApi = {
  login: (data: LoginPayload) =>
    httpClient.post<LoginResponse>("/usuarios/login", data),
};
