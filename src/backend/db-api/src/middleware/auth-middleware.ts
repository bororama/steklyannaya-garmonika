import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "express";
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(@Req() req, @Res() res, next: NextFunction) {
    Logger.debug("Executing Auth Middlecare");
        // Check if the Authorization header is present
    const authorizationHeader = req.headers.authorization;

    console.log('***********************************')
    console.log(authorizationHeader)

    if (!authorizationHeader) {
      res.status(401).json({ message: 'Unauthorized - JWT token missing' });
      return;
    }

    // Check if the Authorization header has the correct format (Bearer token)
    const [bearer, token] = authorizationHeader.split(' ');

    try {
        let payload : any = jwt.verify(token, 'TODO the REAL secret')
        console.log(payload)
        req.token_payload = payload
    } catch (e) {
      res.status(401).json({ message: 'Unauthorized - Invalid JWT token format' });
      return;
    }

    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({ message: 'Unauthorized - Invalid JWT token format' });
      return;
    }

    next();
    }
}
