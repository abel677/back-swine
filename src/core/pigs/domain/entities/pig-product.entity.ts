import { Product } from "../../../products/domain/entities/product.entity";
import { DomainDateTime } from "../../../shared/domain-datetime";

export interface PigProductProps {
  pigId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

type CreatePigProduct = Omit<PigProductProps, "createdAt" | "updatedAt">;
export type UpdatePigProduct = Omit<Partial<PigProduct>,"createdAt" | "updatedAt" | "pigId">;

export class PigProduct {
  constructor(
    public readonly id: string,
    private readonly props: PigProductProps
  ) {}

  update(props: UpdatePigProduct) {
    if (props.product) {
      this.props.product = props.product;
    }
    if (props.quantity) {
      this.props.quantity = props.quantity;
    }
    if (props.price) {
      this.props.price = props.price;
    }

    this.props.updatedAt = DomainDateTime.now();
  }

  static create(props: CreatePigProduct) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();
    return new PigProduct(id, {
      ...props,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }
  static fromPrimitives(data: { id: string } & PigProductProps): PigProduct {
    return new PigProduct(data.id, {
      ...data,
    });
  }

  get price() {
    return this.props.price;
  }
  get quantity() {
    return this.props.quantity;
  }
  get product() {
    return this.props.product;
  }

  get pigId() {
    return this.props.pigId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
