import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        // Check if the authorization header exists
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Check if the token is a bearer token
        const token = authHeader.split(' ')[1];
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        try {
            // Verify the token
            const decodedToken = jwt.verify(token.slice(7), 'FIVERR0.1');
            req.user = decodedToken;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}
