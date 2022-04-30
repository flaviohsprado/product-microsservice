import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connection } from './commons/config/connectionDatabase.config';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...connection,
    }),
    ProductModule,
  ],
})
export class AppModule {}
