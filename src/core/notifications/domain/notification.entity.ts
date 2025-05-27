interface NotificationProps {
  title: string;
  description: string;
  farmId: string;
  data: string;
  dateSent: Date;
  isRead: boolean;
}

export class Notification {
  private constructor(
    public readonly id: string,
    private readonly props: NotificationProps
  ) {}

  static create(props: Omit<NotificationProps, "isRead">) {
    const id = crypto.randomUUID();

    return new Notification(id, {
      ...props,
      isRead: false,
    });
  }

  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get farmId(): string {
    return this.props.farmId;
  }
  get dateSent(): Date {
    return this.props.dateSent;
  }
  get isRead(): boolean {
    return this.props.isRead;
  }
  get data(): string {
    return this.props.data;
  }

  static fromPersistence(props: {
    id: string;
    title: string;
    description: string;
    farmId: string;
    data: string;
    dateSent: Date;
    isRead: boolean;
  }) {
    return new Notification(props.id, {
      title: props.title,
      description: props.description,
      farmId: props.farmId,
      data: props.data,
      dateSent: props.dateSent,
      isRead: props.isRead,
    });
  }
}
