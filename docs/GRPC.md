# gRPC Service Documentation

## Server Configuration
- **Host**: `0.0.0.0`
- **Port**: `5001`
- **Package**: `auth`
- **Proto File**: `proto/auth.proto`

## Service Methods

### 1. ValidateToken
Validates a JWT access token and returns user information.

**Request**:
```protobuf
message ValidateTokenRequest {
  string token = 1;
}
```

**Response**:
```protobuf
message ValidateTokenResponse {
  bool valid = 1;
  string userId = 2;
  repeated string roles = 3;
}
```

**Example (Node.js)**:
```javascript
const response = await client.ValidateToken({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
});
console.log(response.valid, response.userId);
```

### 2. GetUserById
Retrieves user information by user ID.

**Request**:
```protobuf
message GetUserByIdRequest {
  string userId = 1;
}
```

**Response**:
```protobuf
message UserResponse {
  string id = 1;
  string email = 2;
  string status = 3;
  repeated string roles = 4;
}
```

### 3. GetUserPermissions
Gets all permissions for a specific user.

**Request**:
```protobuf
message GetUserPermissionsRequest {
  string userId = 1;
}
```

**Response**:
```protobuf
message PermissionsResponse {
  repeated Permission permissions = 1;
}

message Permission {
  string resource = 1;
  string action = 2;
  string conditions = 3; // JSON string
}
```

### 4. CheckPermission
Checks if a user has a specific permission with context.

**Request**:
```protobuf
message CheckPermissionRequest {
  string userId = 1;
  string resource = 2;
  string action = 3;
  string context = 4; // JSON string
}
```

**Response**:
```protobuf
message CheckPermissionResponse {
  bool allowed = 1;
  string reason = 2;
}
```

**Example**:
```javascript
const response = await client.CheckPermission({
  userId: 'user-123',
  resource: 'product',
  action: 'delete',
  context: JSON.stringify({ productId: 'prod-456' })
});
console.log(response.allowed, response.reason);
```

### 5. HealthCheck
Health check endpoint for service monitoring.

**Request**:
```protobuf
message HealthCheckRequest {}
```

**Response**:
```protobuf
message HealthCheckResponse {
  string status = 1;
}
```

## Client Setup

### Node.js Client
```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/auth.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService(
  'localhost:5001',
  grpc.credentials.createInsecure()
);

// Use the client
client.ValidateToken({ token: 'jwt-token' }, (err, response) => {
  if (err) console.error(err);
  else console.log(response);
});
```

### Go Client
```go
import (
    "google.golang.org/grpc"
    pb "path/to/generated/auth"
)

conn, err := grpc.Dial("localhost:5001", grpc.WithInsecure())
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

client := pb.NewAuthServiceClient(conn)
response, err := client.ValidateToken(context.Background(), &pb.ValidateTokenRequest{
    Token: "jwt-token",
})
```

## Interceptors

### Logging Interceptor
All gRPC requests and responses are logged with:
- Method name
- Request data
- Response data
- Execution time

## Error Handling

gRPC errors follow standard status codes:
- `OK` (0): Success
- `INVALID_ARGUMENT` (3): Invalid request
- `NOT_FOUND` (5): Resource not found
- `PERMISSION_DENIED` (7): Authorization failed
- `INTERNAL` (13): Server error

## Testing

Use `grpcurl` for testing:
```bash
# Health check
grpcurl -plaintext localhost:5001 auth.AuthService/HealthCheck

# Validate token
grpcurl -plaintext -d '{"token": "jwt-token"}' \
  localhost:5001 auth.AuthService/ValidateToken
```
