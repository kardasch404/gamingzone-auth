export interface ActivityLogProps {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export class ActivityLog {
  private props: ActivityLogProps;

  constructor(props: ActivityLogProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get action(): string {
    return this.props.action;
  }

  get resource(): string | undefined {
    return this.props.resource;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get ipAddress(): string {
    return this.props.ipAddress;
  }

  get userAgent(): string {
    return this.props.userAgent;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): ActivityLogProps {
    return { ...this.props };
  }
}
