import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateProductRequestDto,
  DecreaseStockRequestDto,
  FindOneRequestDto,
} from './dto/product.dto';
import { Product } from './entities/product.entity';
import { StockDecreaseLog } from './entities/stockDecreaseLog.entity';
import {
  CreateProductResponse,
  DecreaseStockResponse,
  FindOneResponse,
} from './product.pb';

@Injectable()
export class ProductService {
  @InjectRepository(Product)
  private readonly repository: Repository<Product>;

  @InjectRepository(StockDecreaseLog)
  private readonly decreaseLogRepository: Repository<StockDecreaseLog>;

  public async findOne({ id }: FindOneRequestDto): Promise<FindOneResponse> {
    const product: Product = await this.repository.findOne({ where: { id } });

    if (!product) {
      return {
        data: null,
        error: ['Product not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return { data: product, error: null, status: HttpStatus.OK };
  }

  public async createProduct(
    payload: CreateProductRequestDto,
  ): Promise<CreateProductResponse> {
    const product: Product = this.repository.create(payload);

    await this.repository.save(product);

    return { id: product.id, error: null, status: HttpStatus.OK };
  }

  public async decreaseStock({
    id,
    orderId,
  }: DecreaseStockRequestDto): Promise<DecreaseStockResponse> {
    const product: Product = await this.repository.findOne({
      select: ['id', 'stock'],
      where: { id },
    });

    if (!product) {
      return { error: ['Product not found'], status: HttpStatus.NOT_FOUND };
    } else if (product.stock <= 0) {
      return { error: ['Stock too low'], status: HttpStatus.CONFLICT };
    }

    const isAlreadyDecreased: number = await this.decreaseLogRepository.count({
      where: { orderId },
    });

    if (isAlreadyDecreased) {
      return {
        error: ['Stock already decreased'],
        status: HttpStatus.CONFLICT,
      };
    }

    await this.repository.update(product.id, { stock: product.stock - 1 });
    await this.decreaseLogRepository.insert({ product, orderId });

    return { error: null, status: HttpStatus.OK };
  }
}
