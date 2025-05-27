export class UserPlan {
  private constructor(
    private readonly _userId: string,
    private readonly _planId: string
  ) {}

  static create(props: { userId: string; planId: string }): UserPlan {
    return new UserPlan(props.userId, props.planId);
  }

  static fromPrimitives(props: { userId: string; planId: string }) {
    return new UserPlan(props.userId, props.planId);
  }

  // Getters
  get userId() {
    return this._userId;
  }

  get planId() {
    return this._planId;
  }
}
