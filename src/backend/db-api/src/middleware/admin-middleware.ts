import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "connect";
import { AdminsService } from "../admins/admins.service";

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    constructor (
        private readonly adminService: AdminsService
    ) {}
    use(@Req() req, @Res() res, next: NextFunction) {
        let userId: number;
        

        // This should be change for the user id number located in the JWT Token
        userId = req.token_payload.username;
        Logger.debug("Admin middleware executed");
        this.adminService.isAdmin(userId).then((answer) => {
            if (answer) {
                next();
            }
            else {
                res.status(401).json({ message: "Unathorized - You are not an Admin"});
            }
        })
    }
}
