import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "express";
import { UserStatus } from "../users/dto/user-status.enum";

@Injectable()
export class ConnectedMiddleware implements NestMiddleware {
    constructor (
    ) {}
    use(@Req() req, @Res() res, next: NextFunction) {
		if (!req)
		{
			res.status(401).json({ message: 'Unauthorized - Request info missing' });
			return;
		}

		if (!req.requester_info || !req.requester_info.status) {
			res.status(401).json({ message: 'Unauthorized - Requester info missing' });
			return;
		}
		
		if (req.requester_info.status == UserStatus.offline)
		{
			res.status(401).json({ message: 'Unauthorized - Requester not connected. Contact an admin if there is any issue.' });
			return;
		}

    	next();
    }
}