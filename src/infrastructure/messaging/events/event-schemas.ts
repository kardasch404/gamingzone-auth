export interface BaseEvent {
  eventType: string;
  version: string;
  timestamp: string;
  metadata: {
    correlationId: string;
    causationId: string;
  };
}

export interface UserRegisteredEvent extends BaseEvent {
  eventType: 'user.registered';
  version: '1.0';
  data: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export interface UserLoggedInEvent extends BaseEvent {
  eventType: 'user.logged_in';
  version: '1.0';
  data: {
    userId: string;
    email: string;
    ipAddress: string;
    userAgent: string;
  };
}

export interface RoleAssignedEvent extends BaseEvent {
  eventType: 'role.assigned';
  version: '1.0';
  data: {
    userId: string;
    roleId: string;
    roleName: string;
    assignedBy: string;
  };
}

export interface RoleCreatedEvent extends BaseEvent {
  eventType: 'role.created';
  version: '1.0';
  data: {
    roleId: string;
    name: string;
    isSystem: boolean;
  };
}

export interface PermissionsAssignedEvent extends BaseEvent {
  eventType: 'permissions.assigned';
  version: '1.0';
  data: {
    roleId: string;
    permissionIds: string[];
  };
}
