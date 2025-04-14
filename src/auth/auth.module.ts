import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hash/hashing.service';
import { BcryptService } from './hash/bcrypt.service';

@Global()
@Module({
    exports: [HashingServiceProtocol],
    providers: [
        {
            provide: HashingServiceProtocol,
            useClass: BcryptService,
        }
    ],
})
export class AuthModule {}
