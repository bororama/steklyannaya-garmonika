import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "express";
import { UsersService } from "../users/services/users.service";

@Injectable()
export class AuthenticMiddleware implements NestMiddleware {
    constructor (
      private readonly userService: UsersService
    ) {}
    async use(@Req() req, @Res() res, next: NextFunction) {
		Logger.debug("Executing Authentication Middlecare");
		if (!req) {
			res.status(401).json({ message: 'Unauthorized - Request info missing' });
			return;
		}

		if (!req.token_payload || !req.token_payload.username) {
			res.status(401).json({ message: 'Unauthorized - JWT token missing' });
			return;
		}

        const user = await this.userService.findOneLight(req.token_payload.username);
		if (!user)
		{
			res.status(401).json({ message: 'Unauthorized - Invalid JWT token format' });
			return;
		}
		req.requester_info = user;

		Logger.debug("Executing Authentication Success");
    	next();
    }
}