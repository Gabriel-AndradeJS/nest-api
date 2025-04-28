import { createParamDecorator, ExecutionContext, Injectable } from "@nestjs/common";
import { REQUEST_TOKEN_PAYLOAD_NAME } from "../common/auth.constants";

export const TokenPayloadParam = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): any => {
        const context = ctx.switchToHttp();
        const request = context.getRequest();
        
        return request[REQUEST_TOKEN_PAYLOAD_NAME];
    },
)