import { HashingServiceProtocol } from "./hashing.service";
import * as bcrypt from 'bcryptjs';

export class BcryptService extends HashingServiceProtocol {

    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

}