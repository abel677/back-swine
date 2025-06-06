import { Farm } from "../../../farms/domain/entities/farm.entity";
import { DomainDateTime } from "../../../shared/domain-datetime";
import { Category } from "./category.entity";

export class Product {
  private constructor(
    public readonly id: string,
    private _farm: Farm,
    private _category: Category,
    private _name: string,
    private _description: string,
    private _price: number,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: {
    farm: Farm;
    category: Category;
    name: string;
    description: string;
    price: number;
  }) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new Product(
      id,
      props.farm,
      props.category,
      props.name,
      props.description,
      props.price,
      currentDate,
      currentDate
    );
  }

  static fromPrimitives(props: {
    id: string;
    farm: Farm;
    category: Category;
    name: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Product(
      props.id,
      props.farm,
      props.category,
      props.name,
      props.description,
      props.price,
      props.createdAt,
      props.updatedAt
    );
  }

  update(props: {
    name?: string;
    description?: string;
    price?: number;
    category?: Category;
    farm?: Farm;
  }) {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.price !== undefined) {
      this._price = props.price;
    }
    if (props.category !== undefined) {
      this._category = props.category;
    }
    if (props.farm !== undefined) {
      this._farm = props.farm;
    }
    this._updatedAt = DomainDateTime.now();
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get price() {
    return this._price;
  }

  get category() {
    return this._category;
  }

  get farm() {
    return this._farm;
  }
}
