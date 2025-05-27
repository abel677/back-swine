export class FarmUsers {
  private constructor(
    public readonly _farmId: string,
    public readonly _userId: string
  ) {}

  static create(props: { farmId: string; userId: string }) {
    return new FarmUsers(props.farmId, props.userId);
  }

  static fromPrimitives(props: { userId: string; planId: string }) {
    return new FarmUsers(props.userId, props.planId);
  }

  get userId() {
    return this._userId;
  }

  get farmId() {
    return this._farmId;
  }
}
