export type loginDetails = {
    password: string,
    email: string,
    rememberMe: boolean
}

export type jwtPayload = {
    sub: string,
    sid: string | null,
    role: string | null,
    iss: string,
    aud: string,
    iat: number,
    exp: number
}