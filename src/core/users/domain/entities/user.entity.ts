import { DomainDateTime } from "../../../shared/domain-datetime";
import { UserPlan } from "./user-plan.entity";

export class User {
  private constructor(
    private readonly _id: string,
    //private readonly _name: string,
    private readonly _email: string,
    private readonly _password: string,
    private readonly _isOwner: boolean,
    private _validated: boolean,
    private _verificationToken: string,
    private readonly _state: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _userPlan: UserPlan | null
  ) {}

  static create(props: {
    //name: string;
    email: string;
    password: string;
    isOwner: boolean;
  }) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new User(
      id,
      //props.name,
      props.email,
      props.password,
      props.isOwner,
      false,
      crypto.randomUUID(),
      true,
      currentDate,
      currentDate,
      null
    );
  }
  static fromPrimitives(props: {
    id: string;
    //name: string;
    email: string;
    password: string;
    isOwner: boolean;
    validated: boolean;
    verificationToken: string;
    state: boolean;
    createdAt: Date;
    updatedAt: Date;
    userPlan: UserPlan;
  }): User {
    return new User(
      props.id,
      //props.name,
      props.email,
      props.password,
      props.isOwner,
      props.validated,
      props.verificationToken,
      props.state,
      props.createdAt,
      props.updatedAt,
      props.userPlan
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  // get name(): string {
  //   return this._name;
  // }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get isOwner(): boolean {
    return this._isOwner;
  }

  get validated(): boolean {
    return this._validated;
  }
  validate() {
    this._validated = true;
  }

  get verificationToken(): string {
    return this._verificationToken;
  }

  resetVerificationToken() {
    this._verificationToken = "";
  }

  get state(): boolean {
    return this._state;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateUpdatedAt() {
    this._updatedAt = DomainDateTime.now();
  }

  get userPlan(): UserPlan | null {
    return this._userPlan;
  }
}
