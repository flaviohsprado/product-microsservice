import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class StockDecreaseLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'integer' })
  public orderId!: number;

  @ManyToOne(() => Product, (product) => product.stockDecreaseLogs)
  public product: Product;
}
