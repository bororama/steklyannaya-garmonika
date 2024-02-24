import { Injectable, Logger, NestMiddleware, Req, Res } from "@nestjs/common";
import { NextFunction } from "connect";
import { AdminsService } from "../admins/admins.service";

@Injectable()
export class AdminMiddleware implements NestMiddleware {
    constructor (
        private readonly adminService: AdminsService
    ) {}
    async use(@Req() req, @Res() res, next: NextFunction) {
        Logger.debug("Admin middleware executed");
        if (await this.adminService.isAdmin(req.requester_info.dataValues.id)) {
          console.log("YES YOU ARE ADMIN")
            next();
        }
        else {
            res.status(401).json({ message: "Unathorized - You are not an Admin"});
        }
    }
}
