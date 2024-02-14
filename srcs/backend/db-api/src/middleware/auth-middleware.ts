import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "express";
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly jwt_log_secret : string = this.configService.get('JWT_LOG_SECRET');

    constructor (private readonly configService: ConfigService) {}

    use(@Req() req, @Res() res, next: NextFunction) {
        Logger.debug("Executing Auth Middlecare");
        // Check if the Authorization header is present
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            res.status(401).json({ message: 'Unauthorized - JWT token missing' });
            return;
        }

        // Check if the Authorization header has the correct format (Bearer token)
        const [bearer, token] = authorizationHeader.split(' ');

        try {
            let payload : any = jwt.verify(token, this.jwt_log_secret)
            req.token_payload = payload
        } catch (e) {
            res.status(401).json({ message: 'Unauthorized - Invalid JWT token format' });
            return;
        }

        if (bearer !== 'Bearer' || !token) {
            res.status(401).json({ message: 'Unauthorized - Invalid JWT token format' });
            return;
        }

        Logger.debug("Auth Middlecare Success");
        next();
    }
}
