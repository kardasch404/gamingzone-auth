# GraphQL API Documentation

## Endpoint
`http://localhost:4001/graphql`

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Queries

### Get Current User
```graphql
query {
  me {
    id
    email
    status
    firstName
    lastName
    emailVerified
    createdAt
  }
}
```

### Get All Roles (Admin only)
```graphql
query {
  roles {
    id
    name
    description
    isSystem
    usersCount
    createdAt
  }
}
```

## Mutations

### Register
```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
    firstName: "John"
    lastName: "Doe"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
    }
  }
}
```

### Login
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      status
    }
  }
}
```

### Update Profile
```graphql
mutation {
  updateProfile(input: {
    firstName: "Jane"
    lastName: "Smith"
  }) {
    id
    firstName
    lastName
  }
}
```

### Create Role (Admin only)
```graphql
mutation {
  createRole(
    name: "MODERATOR"
    description: "Moderator role"
  ) {
    id
    name
    description
  }
}
```

### Logout
```graphql
mutation {
  logout(refreshToken: "refresh_token_here")
}
```
