
export class PayloadTokenDto {
    sub: number;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}