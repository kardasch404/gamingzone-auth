export class Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: any;
  createdAt: Date;
  updatedAt: Date;
}
