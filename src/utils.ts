import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserDto } from './user/dto/login-user.dto';

export const hashPassword = async (password: string): Promise<string> => {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
}

export const generateAccessToken = async (user: LoginUserDto): Promise<string> => {
    const payload = { email: user.email, sub: user.password };
    const options = { expiresIn: '1h' };
    const token = await jwt.sign(payload, 'FIVERR0.1', options);
    return token;
}
