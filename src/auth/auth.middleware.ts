import { Injectable, NestMiddleware } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        let token = req.header('accessToken');

        if (!token) {
            token = req.headers.authorization?.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ statusCode: 401, message: 'Authorization header missing' });
        }

        // Check if the token is a bearer token
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ statusCode: 401, message: 'Invalid token format' });
        }

        try {
            // Verify the token
            const decodedToken: any = jwt.verify(token.slice(7), 'FIVERR0.1');
            req.user = decodedToken;
            next();
        } catch (err) {
            return res.status(401).json({ statusCode: 401, message: 'Invalid token' });
        }
    }
}
