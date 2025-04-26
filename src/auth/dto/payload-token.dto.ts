
export class PayloadTokenDto {
    id: number;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}