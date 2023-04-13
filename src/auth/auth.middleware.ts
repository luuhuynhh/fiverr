import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        // For swagger @ApiHeader
        let token = req.header('accessToken');

        // For others
        if (!token) {
            token = req.headers.authorization;
        }

        if (!token) {
            return res.status(401).json({ statusCode: 401, message: 'Authorization header missing' });
        }

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ statusCode: 401, message: 'Invalid token format' });
        }

        try {
            // Verify
            const decodedToken: any = jwt.verify(token.slice(7), 'FIVERR0.1');
            req.user = decodedToken;
            next();
        } catch (err) {
            return res.status(401).json({ statusCode: 401, message: 'Invalid token' });
        }
    }
}
