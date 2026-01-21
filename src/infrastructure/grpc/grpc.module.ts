import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthGrpcController } from '../../presentation/grpc/controllers/auth-grpc.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../../proto/auth.proto'),
          url: '0.0.0.0:5001',
        },
      },
    ]),
  ],
  controllers: [AuthGrpcController],
})
export class GrpcModule {}
