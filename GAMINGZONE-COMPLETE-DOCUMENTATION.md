# 🎮 GamingZone - Complete Microservices Architecture Documentation

> **The Ultimate Guide to GamingZone E-Commerce Platform**  
> A production-ready microservices architecture built with NestJS, Clean Architecture, and DDD principles.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Class Diagrams](#class-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Getting Started](#getting-started)
6. [Running Services](#running-services)
7. [Testing APIs](#testing-apis)
8. [Deployment Guide](#deployment-guide)

---

## 🌐 System Overview

GamingZone is a modern e-commerce platform for gaming products built with microservices architecture. The platform consists of 6 core services communicating via REST, GraphQL, gRPC, and Kafka.

### Core Services

| Service | Port | gRPC Port | Description |
|---------|------|-----------|-------------|
| **Auth Service** | 4001 | 5001 | Authentication, Authorization, RBAC |
| **Catalog Service** | 4002 | 5002 | Products, Categories, Platforms |
| **Order Service** | 4003 | 5003 | Order Management, Cart |
| **Payment Service** | 4004 | 5004 | Stripe Integration, Payments |
| **Inventory Service** | 4005 | 5005 | Stock Management, Reservations |
| **Notification Service** | 4006 | 5006 | Email, SMS, WebSocket |

### Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        A[React/Next.js]
    end
    
    subgraph "API Layer"
        B[API Gateway - Kong/NGINX]
    end
    
    subgraph "Microservices"
        C[Auth Service<br/>NestJS + TypeScript]
        D[Catalog Service<br/>NestJS + TypeScript]
        E[Order Service<br/>NestJS + TypeScript]
        F[Payment Service<br/>NestJS + TypeScript]
        G[Inventory Service<br/>NestJS + TypeScript]
        H[Notification Service<br/>NestJS + TypeScript]
    end
    
    subgraph "Data Layer"
        I[(PostgreSQL<br/>Auth DB)]
        J[(PostgreSQL<br/>Catalog DB)]
        K[(PostgreSQL<br/>Order DB)]
        L[(PostgreSQL<br/>Payment DB)]
        M[(PostgreSQL<br/>Inventory DB)]
        N[(Redis<br/>Cache + Sessions)]
        O[(ElasticSearch<br/>Product Search)]
    end
    
    subgraph "Message Queue"
        P[Kafka<br/>Event Bus]
    end
    
    subgraph "External Services"
        Q[Stripe API]
        R[AWS SES]
        S[AWS S3]
    end
    
    A -->|HTTPS| B
    B --> C & D & E & F & G & H
    
    C --> I & N & P
    D --> J & N & O & P
    E --> K & N & P
    F --> L & N & P & Q
    G --> M & N & P
    H --> N & P & R
    
    D -.->|gRPC| G
    E -.->|gRPC| C & D & G
    F -.->|gRPC| E
    
    style A fill:#61dafb
    style B fill:#009639
    style C fill:#e0234e
    style D fill:#e0234e
    style E fill:#e0234e
    style F fill:#e0234e
    style G fill:#e0234e
    style H fill:#e0234e
    style P fill:#231f20
```

---

## 🏗️ Architecture Diagrams

### High-Level System Architecture

```mermaid
C4Context
    title System Context Diagram - GamingZone Platform
    
    Person(customer, "Customer", "Browses and purchases gaming products")
    Person(admin, "Admin", "Manages products, orders, inventory")
    
    System(gamingzone, "GamingZone Platform", "E-commerce platform for gaming products")
    
    System_Ext(stripe, "Stripe", "Payment processing")
    System_Ext(email, "AWS SES", "Email notifications")
    System_Ext(storage, "AWS S3", "File storage")
    
    Rel(customer, gamingzone, "Uses", "HTTPS")
    Rel(admin, gamingzone, "Manages", "HTTPS")
    Rel(gamingzone, stripe, "Processes payments", "API")
    Rel(gamingzone, email, "Sends emails", "API")
    Rel(gamingzone, storage, "Stores files", "API")
```

### Microservices Communication Flow

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "Gateway Layer"
        GATEWAY[API Gateway<br/>Port: 3000]
    end
    
    subgraph "Service Layer"
        AUTH[🔐 Auth Service<br/>REST: 4001<br/>gRPC: 5001]
        CATALOG[📦 Catalog Service<br/>REST: 4002<br/>gRPC: 5002]
        ORDER[🛒 Order Service<br/>REST: 4003<br/>gRPC: 5003]
        PAYMENT[💳 Payment Service<br/>REST: 4004<br/>gRPC: 5004]
        INVENTORY[📊 Inventory Service<br/>REST: 4005<br/>gRPC: 5005]
        NOTIFY[📧 Notification Service<br/>REST: 4006<br/>gRPC: 5006]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Databases)]
        REDIS[(Redis<br/>Cache)]
        ELASTIC[(ElasticSearch<br/>Search Engine)]
    end
    
    subgraph "Message Layer"
        KAFKA[Apache Kafka<br/>Event Streaming]
    end
    
    WEB -->|HTTPS| GATEWAY
    MOBILE -->|HTTPS| GATEWAY
    
    GATEWAY -->|REST/GraphQL| AUTH
    GATEWAY -->|REST/GraphQL| CATALOG
    GATEWAY -->|REST/GraphQL| ORDER
    GATEWAY -->|REST/GraphQL| PAYMENT
    
    ORDER -.->|gRPC| AUTH
    ORDER -.->|gRPC| CATALOG
    ORDER -.->|gRPC| INVENTORY
    PAYMENT -.->|gRPC| ORDER
    
    AUTH --> POSTGRES
    CATALOG --> POSTGRES
    ORDER --> POSTGRES
    PAYMENT --> POSTGRES
    INVENTORY --> POSTGRES
    
    AUTH --> REDIS
    CATALOG --> REDIS
    ORDER --> REDIS
    
    CATALOG --> ELASTIC
    
    AUTH --> KAFKA
    CATALOG --> KAFKA
    ORDER --> KAFKA
    PAYMENT --> KAFKA
    INVENTORY --> KAFKA
    NOTIFY --> KAFKA
    
    style WEB fill:#61dafb
    style MOBILE fill:#61dafb
    style GATEWAY fill:#009639
    style AUTH fill:#e0234e
    style CATALOG fill:#e0234e
    style ORDER fill:#e0234e
    style PAYMENT fill:#e0234e
    style INVENTORY fill:#e0234e
    style NOTIFY fill:#e0234e
    style KAFKA fill:#231f20
```

### Event-Driven Architecture

```mermaid
graph LR
    subgraph "Event Publishers"
        AUTH[Auth Service]
        CATALOG[Catalog Service]
        ORDER[Order Service]
        PAYMENT[Payment Service]
        INVENTORY[Inventory Service]
    end
    
    subgraph "Kafka Topics"
        T1[user.events]
        T2[product.events]
        T3[order.events]
        T4[payment.events]
        T5[inventory.events]
    end
    
    subgraph "Event Consumers"
        NOTIFY[Notification Service]
        ANALYTICS[Analytics Service]
        AUDIT[Audit Service]
    end
    
    AUTH -->|UserRegistered<br/>UserLoggedIn| T1
    CATALOG -->|ProductCreated<br/>ProductUpdated| T2
    ORDER -->|OrderCreated<br/>OrderConfirmed<br/>OrderCancelled| T3
    PAYMENT -->|PaymentSucceeded<br/>PaymentFailed<br/>RefundProcessed| T4
    INVENTORY -->|StockReserved<br/>StockDeducted<br/>StockLow| T5
    
    T1 --> NOTIFY
    T2 --> ANALYTICS
    T3 --> NOTIFY & ANALYTICS & AUDIT
    T4 --> ORDER & NOTIFY & AUDIT
    T5 --> CATALOG & NOTIFY
    
    style AUTH fill:#e0234e
    style CATALOG fill:#e0234e
    style ORDER fill:#e0234e
    style PAYMENT fill:#e0234e
    style INVENTORY fill:#e0234e
    style NOTIFY fill:#4caf50
    style ANALYTICS fill:#4caf50
    style AUDIT fill:#4caf50
```

---

## 📐 Class Diagrams

### 1. Auth Service - Complete Domain Model

```mermaid
classDiagram
    %% Domain Entities
    class User {
        +UUID id
        +Email email
        +Password password
        +UserStatus status
        +DateTime emailVerifiedAt
        +DateTime lastLoginAt
        +DateTime createdAt
        +DateTime updatedAt
        +UserRole[] userRoles
        +RefreshToken[] refreshTokens
        +create(data) User
        +assignRole(role) void
        +removeRole(roleId) void
        +activate() void
        +suspend() void
        +verifyEmail() void
        +updateLastLogin() void
    }

    class Role {
        +UUID id
        +string name
        +string description
        +boolean isSystem
        +DateTime createdAt
        +DateTime updatedAt
        +RolePermission[] rolePermissions
        +UserRole[] userRoles
        +addPermission(permission) void
        +removePermission(permissionId) void
        +canBeDeleted() boolean
    }

    class Permission {
        +UUID id
        +string resource
        +string action
        +JSON conditions
        +string description
        +DateTime createdAt
        +RolePermission[] rolePermissions
        +evaluateCondition(context) boolean
    }

    class UserRole {
        +UUID userId
        +UUID roleId
        +DateTime assignedAt
        +DateTime expiresAt
        +User user
        +Role role
    }

    class RolePermission {
        +UUID roleId
        +UUID permissionId
        +DateTime grantedAt
        +Role role
        +Permission permission
    }

    class RefreshToken {
        +UUID id
        +UUID userId
        +string token
        +DateTime expiresAt
        +DateTime createdAt
        +User user
        +isValid() boolean
    }

    %% Value Objects
    class Email {
        -string value
        +create(email) Email
        +getValue() string
        -validate() void
    }

    class Password {
        -string hashedValue
        +create(plain) Password
        +compare(plain) boolean
        -hash(plain) string
        -validateStrength(plain) void
    }

    %% Use Cases
    class RegisterUserUseCase {
        -IUserRepository userRepo
        -IRoleRepository roleRepo
        -IEventBus eventBus
        +execute(command) Promise~UserDTO~
    }

    class LoginUseCase {
        -IUserRepository userRepo
        -JwtService jwtService
        -PermissionEvaluator permissionEvaluator
        +execute(command) Promise~AuthPayloadDTO~
    }

    class PermissionEvaluator {
        -IUserRepository userRepo
        -RedisService cache
        +hasPermission(userId, resource, action, context) Promise~boolean~
        -evaluateCondition(condition, context) boolean
        -getUserPermissions(userId) Promise~Permission[]~
    }

    %% Repositories
    class IUserRepository {
        <<interface>>
        +findById(id) Promise~User~
        +findByEmail(email) Promise~User~
        +save(user) Promise~void~
        +delete(id) Promise~void~
    }

    class UserRepository {
        -PrismaService prisma
        -RedisService cache
        +findById(id) Promise~User~
        +findByEmail(email) Promise~User~
        +save(user) Promise~void~
        +delete(id) Promise~void~
    }

    %% Relationships
    User "1" --> "*" UserRole : has
    User "1" --> "*" RefreshToken : has
    User "1" --> "1" Email : uses
    User "1" --> "1" Password : uses
    
    Role "1" --> "*" UserRole : has
    Role "1" --> "*" RolePermission : has
    
    Permission "1" --> "*" RolePermission : belongs to
    
    UserRole "*" --> "1" User : belongs to
    UserRole "*" --> "1" Role : belongs to
    
    RolePermission "*" --> "1" Role : belongs to
    RolePermission "*" --> "1" Permission : belongs to
    
    RegisterUserUseCase --> IUserRepository
    RegisterUserUseCase --> IRoleRepository
    LoginUseCase --> IUserRepository
    PermissionEvaluator --> IUserRepository
    
    UserRepository ..|> IUserRepository
```

### 2. Order Service - Complete Domain Model

```mermaid
classDiagram
    %% Domain Entities
    class Order {
        +UUID id
        +string orderNumber
        +UUID userId
        +OrderStatus status
        +PaymentStatus paymentStatus
        +FulfillmentStatus fulfillmentStatus
        +Decimal subtotal
        +Decimal taxAmount
        +Decimal shippingCost
        +Decimal discount
        +Decimal totalAmount
        +string currency
        +JSON shippingAddress
        +JSON billingAddress
        +string paymentMethod
        +string paymentId
        +DateTime paidAt
        +string notes
        +string cancelReason
        +DateTime cancelledAt
        +DateTime estimatedDelivery
        +DateTime deliveredAt
        +DateTime createdAt
        +DateTime updatedAt
        +OrderItem[] items
        +OrderStatusHistory[] statusHistory
        +create(data) Order
        +confirm(paymentId) void
        +cancel(reason) void
        +ship(trackingNumber) void
        +deliver() void
        +calculateTotal() void
    }

    class OrderItem {
        +UUID id
        +UUID orderId
        +UUID productId
        +string sku
        +string name
        +Decimal price
        +int quantity
        +Decimal subtotal
        +string image
        +string reservationId
        +DateTime createdAt
        +Order order
        +calculateSubtotal() Money
    }

    class OrderStatusHistory {
        +UUID id
        +UUID orderId
        +OrderStatus fromStatus
        +OrderStatus toStatus
        +string changedBy
        +string reason
        +string notes
        +DateTime createdAt
        +Order order
    }

    %% Enums
    class OrderStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        PROCESSING
        SHIPPED
        DELIVERED
        CANCELLED
        REFUNDED
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        PAID
        FAILED
        REFUNDED
    }

    class FulfillmentStatus {
        <<enumeration>>
        UNFULFILLED
        PARTIALLY_FULFILLED
        FULFILLED
        RETURNED
    }

    %% Use Cases
    class CreateOrderUseCase {
        -IOrderRepository orderRepo
        -CartService cartService
        -CatalogGrpcClient catalogClient
        -InventoryGrpcClient inventoryClient
        -IEventBus eventBus
        -OrderNumberGenerator orderNumberGen
        +execute(command) Promise~OrderDTO~
        -validateCart(cart) Promise~ValidationResult~
        -reserveStock(items) Promise~void~
        -calculateTotals(items) OrderTotals
    }

    class CancelOrderUseCase {
        -IOrderRepository orderRepo
        -InventoryGrpcClient inventoryClient
        -IEventBus eventBus
        +execute(command) Promise~void~
        -releaseStockReservations(order) Promise~void~
    }

    %% Relationships
    Order "1" --> "*" OrderItem : contains
    Order "1" --> "*" OrderStatusHistory : has
    Order --> OrderStatus : uses
    Order --> PaymentStatus : uses
    Order --> FulfillmentStatus : uses
    
    CreateOrderUseCase --> IOrderRepository
    CreateOrderUseCase --> CartService
    CancelOrderUseCase --> IOrderRepository
```

### 3. Inventory Service - Complete Domain Model

```mermaid
classDiagram
    %% Domain Entities
    class Stock {
        +UUID id
        +string sku
        +UUID warehouseId
        +int quantity
        +int reserved
        +int available
        +int minThreshold
        +int maxCapacity
        +int version
        +DateTime lastStockAt
        +DateTime createdAt
        +DateTime updatedAt
        +Warehouse warehouse
        +StockMovement[] movements
        +StockReservation[] reservations
        +reserve(quantity, orderId, expiresAt) StockReservation
        +release(quantity) void
        +deduct(quantity) void
        +add(quantity) void
        +adjust(newQuantity) void
        +isLowStock() boolean
    }

    class StockReservation {
        +UUID id
        +UUID stockId
        +string orderId
        +int quantity
        +ReservationStatus status
        +DateTime reservedAt
        +DateTime expiresAt
        +DateTime releasedAt
        +DateTime createdAt
        +DateTime updatedAt
        +Stock stock
        +markAsFulfilled() void
        +release() void
        +expire() void
        +isExpired() boolean
    }

    class StockMovement {
        +UUID id
        +UUID stockId
        +MovementType type
        +int quantity
        +string reason
        +string referenceId
        +int beforeQty
        +int afterQty
        +string performedBy
        +string notes
        +DateTime createdAt
        +Stock stock
    }

    class Warehouse {
        +UUID id
        +string name
        +string code
        +string address
        +string city
        +string country
        +boolean isActive
        +boolean isPrimary
        +DateTime createdAt
        +DateTime updatedAt
        +Stock[] stocks
    }

    %% Enums
    class ReservationStatus {
        <<enumeration>>
        ACTIVE
        FULFILLED
        RELEASED
        EXPIRED
    }

    class MovementType {
        <<enumeration>>
        IN
        OUT
        ADJUSTMENT
        RESERVED
        RELEASED
        DAMAGED
        RETURNED
    }

    %% Use Cases
    class ReserveStockUseCase {
        -IStockRepository stockRepo
        -CatalogGrpcClient catalogClient
        -IEventBus eventBus
        +execute(command) Promise~ReservationDTO~
        -checkAvailability(sku, quantity) Promise~boolean~
    }

    class ReleaseStockReservationUseCase {
        -IStockRepository stockRepo
        -IEventBus eventBus
        +execute(command) Promise~void~
    }

    class DeductStockUseCase {
        -IStockRepository stockRepo
        -IEventBus eventBus
        +execute(command) Promise~void~
    }

    %% Relationships
    Stock "*" --> "1" Warehouse : stored in
    Stock "1" --> "*" StockReservation : has
    Stock "1" --> "*" StockMovement : has
    StockReservation --> ReservationStatus : uses
    StockMovement --> MovementType : uses
    
    ReserveStockUseCase --> IStockRepository
    ReleaseStockReservationUseCase --> IStockRepository
    DeductStockUseCase --> IStockRepository
```

---

## 🔄 Sequence Diagrams

### 1. User Registration & Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway
    participant AuthService
    participant PostgreSQL
    participant Kafka
    participant NotificationService

    %% Registration Flow
    Note over Client,NotificationService: User Registration
    Client->>APIGateway: POST /api/auth/register
    APIGateway->>AuthService: register(dto)
    
    AuthService->>AuthService: Validate email format
    AuthService->>PostgreSQL: Check if email exists
    PostgreSQL-->>AuthService: No user found
    
    AuthService->>AuthService: Hash password (bcrypt)
    AuthService->>PostgreSQL: BEGIN TRANSACTION
    AuthService->>PostgreSQL: INSERT user
    AuthService->>PostgreSQL: Assign CUSTOMER role
    AuthService->>PostgreSQL: COMMIT
    PostgreSQL-->>AuthService: User created
    
    AuthService->>Kafka: Publish UserRegisteredEvent
    AuthService-->>APIGateway: UserDTO
    APIGateway-->>Client: 201 Created {user}
    
    Kafka-->>NotificationService: Consume UserRegisteredEvent
    NotificationService->>NotificationService: Send welcome email
    
    %% Login Flow
    Note over Client,NotificationService: User Login
    Client->>APIGateway: POST /api/auth/login
    APIGateway->>AuthService: login(credentials)
    
    AuthService->>PostgreSQL: findByEmail(email)
    PostgreSQL-->>AuthService: User with hashed password
    
    AuthService->>AuthService: Compare password (bcrypt)
    alt Password valid
        AuthService->>PostgreSQL: Get user roles & permissions
        PostgreSQL-->>AuthService: Roles & Permissions
        
        AuthService->>AuthService: Generate JWT access token (15min)
        AuthService->>AuthService: Generate refresh token (7days)
        
        AuthService->>PostgreSQL: Save refresh token
        AuthService->>PostgreSQL: Update lastLoginAt
        
        AuthService->>Kafka: Publish UserLoggedInEvent
        AuthService-->>APIGateway: {accessToken, refreshToken, user}
        APIGateway-->>Client: 200 OK
    else Password invalid
        AuthService-->>APIGateway: UnauthorizedException
        APIGateway-->>Client: 401 Unauthorized
    end
```

### 2. Complete Order Creation Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway
    participant AuthGuard
    participant OrderService
    participant CartService
    participant CatalogService
    participant InventoryService
    participant PostgreSQL
    participant Redis
    participant Kafka

    %% Authentication
    Client->>APIGateway: POST /api/orders (JWT in header)
    APIGateway->>AuthGuard: canActivate()
    AuthGuard->>AuthGuard: Verify JWT signature
    AuthGuard->>AuthGuard: Extract userId from token
    AuthGuard-->>APIGateway: ✓ Authorized (userId)
    
    APIGateway->>OrderService: createOrder(userId, dto)
    
    %% Load Cart
    OrderService->>CartService: getCart(userId) [gRPC]
    CartService->>Redis: GET cart:userId
    Redis-->>CartService: Cart with items
    CartService-->>OrderService: CartDTO
    
    alt Cart empty
        OrderService-->>APIGateway: EmptyCartException
        APIGateway-->>Client: 400 Bad Request
    end
    
    %% Validate Products
    loop For each cart item
        OrderService->>CatalogService: getProductBySku(sku) [gRPC]
        CatalogService->>PostgreSQL: SELECT product WHERE sku = ?
        PostgreSQL-->>CatalogService: Product
        CatalogService-->>OrderService: ProductDTO
        
        OrderService->>OrderService: Validate product status = ACTIVE
        OrderService->>OrderService: Check price hasn't changed >5%
    end
    
    %% Reserve Stock (CRITICAL)
    Note over OrderService,InventoryService: Stock Reservation with Optimistic Locking
    
    loop For each item
        OrderService->>InventoryService: reserveStock(sku, qty, orderId) [gRPC]
        
        InventoryService->>PostgreSQL: SELECT stock WHERE sku = ? FOR UPDATE
        Note right of PostgreSQL: Pessimistic lock to prevent race conditions
        
        PostgreSQL-->>InventoryService: Stock with current version
        
        alt Stock available >= requested
            InventoryService->>InventoryService: Calculate new values
            Note right of InventoryService: available = quantity - (reserved + qty)<br/>reserved = reserved + qty
            
            InventoryService->>PostgreSQL: UPDATE stock SET reserved = ?, available = ?, version = version + 1 WHERE id = ? AND version = ?
            
            alt Version match (no concurrent update)
                PostgreSQL-->>InventoryService: ✓ Updated
                
                InventoryService->>PostgreSQL: INSERT stock_reservation
                InventoryService->>PostgreSQL: INSERT stock_movement (type=RESERVED)
                
                InventoryService->>Kafka: Publish StockReservedEvent
                InventoryService-->>OrderService: {reservationId, expiresAt}
                
            else Version mismatch (concurrent update)
                PostgreSQL-->>InventoryService: ✗ No rows updated
                InventoryService->>InventoryService: Retry with exponential backoff
            end
            
        else Insufficient stock
            PostgreSQL-->>InventoryService: Stock available < requested
            InventoryService-->>OrderService: InsufficientStockException
            
            Note over OrderService: Rollback: Release already reserved items
            OrderService->>InventoryService: releaseReservation(reservationIds[])
            OrderService-->>APIGateway: 400 Bad Request
            APIGateway-->>Client: "Insufficient stock for SKU-PS5-GOW"
        end
    end
    
    %% Calculate Order Totals
    OrderService->>OrderService: Calculate subtotal
    OrderService->>OrderService: Calculate tax (20% VAT)
    OrderService->>OrderService: Calculate shipping cost
    OrderService->>OrderService: Apply discounts
    OrderService->>OrderService: Calculate total
    
    %% Generate Order Number
    OrderService->>PostgreSQL: BEGIN TRANSACTION
    OrderService->>PostgreSQL: SELECT * FROM order_sequence WHERE year = 2026 FOR UPDATE
    alt Sequence exists
        PostgreSQL-->>OrderService: {year: 2026, lastNumber: 1234}
        OrderService->>PostgreSQL: UPDATE order_sequence SET lastNumber = 1235
    else First order of year
        PostgreSQL-->>OrderService: null
        OrderService->>PostgreSQL: INSERT order_sequence (year=2026, lastNumber=1)
    end
    PostgreSQL-->>OrderService: Updated sequence
    OrderService->>OrderService: Format: ORD-2026-001235
    
    %% Create Order
    OrderService->>PostgreSQL: INSERT order (orderNumber, userId, status=PENDING, totals)
    PostgreSQL-->>OrderService: Order created
    
    OrderService->>PostgreSQL: INSERT order_items (orderId, productId, sku, price, qty, reservationId)
    PostgreSQL-->>OrderService: Items created
    
    OrderService->>PostgreSQL: INSERT order_status_history (orderId, toStatus=PENDING)
    
    OrderService->>PostgreSQL: COMMIT TRANSACTION
    
    %% Clear Cart
    OrderService->>CartService: clearCart(userId) [gRPC]
    CartService->>Redis: DEL cart:userId
    
    %% Publish Events
    OrderService->>Kafka: Publish OrderCreatedEvent
    Note right of Kafka: Event contains:<br/>- orderId<br/>- orderNumber<br/>- userId<br/>- items[]<br/>- totalAmount<br/>- reservationIds[]
    
    OrderService-->>APIGateway: OrderDTO
    APIGateway-->>Client: 201 Created {order}
    
    %% Async Event Processing
    par Notification Service
        Kafka-->>NotificationService: Consume OrderCreatedEvent
        NotificationService->>NotificationService: Send order confirmation email
        NotificationService->>NotificationService: Send WebSocket notification
    and Analytics Service
        Kafka-->>AnalyticsService: Consume OrderCreatedEvent
        AnalyticsService->>AnalyticsService: Track order metrics
    end
```


### 3. Payment Flow (Stripe Checkout)

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway
    participant PaymentService
    participant OrderService
    participant Stripe
    participant Webhook
    participant InventoryService
    participant Kafka
    participant NotificationService

    %% Create Checkout Session
    Note over Client,NotificationService: Payment Initiation
    Client->>APIGateway: POST /api/payments/checkout {orderId}
    APIGateway->>PaymentService: createCheckoutSession(orderId, userId)
    
    PaymentService->>PaymentService: Check idempotency key
    
    PaymentService->>OrderService: getOrder(orderId) [gRPC]
    OrderService-->>PaymentService: OrderDTO
    
    alt Order status != PENDING
        PaymentService-->>APIGateway: InvalidOrderStateException
        APIGateway-->>Client: 400 Bad Request
    end
    
    PaymentService->>PostgreSQL: INSERT payment (orderId, userId, status=PENDING)
    PostgreSQL-->>PaymentService: Payment created
    
    PaymentService->>Stripe: createCheckoutSession({<br/>  amount: 599.99 * 100,<br/>  currency: 'mad',<br/>  line_items: [...],<br/>  metadata: {orderId, paymentId}<br/>})
    Stripe-->>PaymentService: {sessionId, url, payment_intent}
    
    PaymentService->>PostgreSQL: UPDATE payment SET stripePaymentIntentId = ?, status = PROCESSING
    
    PaymentService-->>APIGateway: {sessionId, sessionUrl, paymentId}
    APIGateway-->>Client: 200 OK
    
    Client->>Client: Redirect to Stripe Checkout
    Client->>Stripe: Complete payment on Stripe
    
    %% Webhook Processing
    Note over Stripe,NotificationService: Webhook: Payment Succeeded
    Stripe->>Webhook: POST /webhooks/stripe<br/>Event: payment_intent.succeeded<br/>Signature: whsec_...
    
    Webhook->>PaymentService: handleWebhook(payload, signature)
    
    PaymentService->>PaymentService: Verify webhook signature
    alt Signature invalid
        PaymentService-->>Webhook: 400 Bad Request
    end
    
    PaymentService->>PostgreSQL: INSERT webhook_event (stripeEventId, eventType, payload)
    
    PaymentService->>PostgreSQL: SELECT * FROM webhook_event WHERE stripeEventId = ?
    alt Event already processed (idempotency)
        PostgreSQL-->>PaymentService: Event exists
        PaymentService-->>Webhook: 200 OK (already processed)
    end
    
    PaymentService->>PostgreSQL: SELECT payment WHERE stripePaymentIntentId = ?
    PostgreSQL-->>PaymentService: Payment
    
    PaymentService->>PostgreSQL: UPDATE payment SET status = SUCCEEDED, paidAt = NOW(), paymentMethod = 'card', lastFourDigits = '4242'
    
    %% After Payment Success
    PaymentService->>Kafka: Publish PaymentSucceededEvent {<br/>  paymentId,<br/>  orderId,<br/>  amount,<br/>  userId<br/>}
    
    PaymentService->>PostgreSQL: UPDATE webhook_event SET processed = true
    PaymentService-->>Webhook: 200 OK
    
    %% Order Service Processes Payment Success
    Note over Kafka,NotificationService: Order Confirmation
    Kafka-->>OrderService: Consume PaymentSucceededEvent
    
    OrderService->>PostgreSQL: SELECT order WHERE id = orderId
    PostgreSQL-->>OrderService: Order with items & reservations
    
    OrderService->>PostgreSQL: UPDATE order SET status = CONFIRMED, paymentStatus = PAID, paymentId = ?, paidAt = NOW()
    OrderService->>PostgreSQL: INSERT order_status_history (fromStatus=PENDING, toStatus=CONFIRMED)
    
    %% Deduct Stock (Fulfill Reservations)
    loop For each order item
        OrderService->>InventoryService: deductStock(sku, qty, orderId) [gRPC]
        
        InventoryService->>PostgreSQL: SELECT stock_reservation WHERE orderId = ?
        PostgreSQL-->>InventoryService: Reservation
        
        InventoryService->>PostgreSQL: BEGIN TRANSACTION
        
        InventoryService->>PostgreSQL: UPDATE stock SET quantity = quantity - ?, reserved = reserved - ? WHERE sku = ?
        Note right of PostgreSQL: Deduct from total quantity<br/>Release from reserved
        
        InventoryService->>PostgreSQL: UPDATE stock_reservation SET status = FULFILLED
        InventoryService->>PostgreSQL: INSERT stock_movement (type=OUT, quantity=-qty, reason='Order fulfilled')
        
        InventoryService->>PostgreSQL: COMMIT
        
        InventoryService->>Kafka: Publish StockDeductedEvent
        InventoryService-->>OrderService: ✓ Stock deducted
    end
    
    OrderService->>Kafka: Publish OrderConfirmedEvent
    
    %% Notifications
    par Email Notification
        Kafka-->>NotificationService: Consume OrderConfirmedEvent
        NotificationService->>NotificationService: Load email template 'order-confirmation'
        NotificationService->>NotificationService: Render with order data
        NotificationService->>NotificationService: Send email via AWS SES
    and WebSocket Notification
        NotificationService->>NotificationService: Check if user online (Redis)
        alt User connected
            NotificationService->>Client: WebSocket: "Payment successful! Order confirmed"
        end
    end
```

---

## 🚀 Getting Started

### Prerequisites

Before running GamingZone services, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >= 18.x | Runtime environment |
| **npm** | >= 9.x | Package manager |
| **PostgreSQL** | >= 14.x | Primary database |
| **Redis** | >= 7.x | Cache & sessions |
| **Kafka** | >= 3.x | Event streaming |
| **Docker** | >= 20.x | Containerization (optional) |
| **Docker Compose** | >= 2.x | Multi-container orchestration |

### Project Structure

```
gamingzone/
├── gamingzone-auth/           # Authentication & Authorization Service
├── gamingzone-catalog/        # Product Catalog Service
├── gamingzone-order/          # Order Management Service
├── gamingzone-payment/        # Payment Processing Service
├── gamingzone-inventory/      # Inventory Management Service
├── gamingzone-notification/   # Notification Service
├── gamingzone-infrastructure/ # Docker Compose, Kafka, etc.
└── gamingzone-gateway/        # API Gateway (Kong/NGINX)
```

### Infrastructure Setup

#### Option 1: Using Docker Compose (Recommended)

1. **Navigate to infrastructure directory:**
```bash
cd gamingzone-infrastructure
```

2. **Start all infrastructure services:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (Port: 5432)
- Redis (Port: 6379)
- Kafka (Port: 9092)
- Zookeeper (Port: 2181)
- ElasticSearch (Port: 9200)
- Kibana (Port: 5601)

3. **Verify services are running:**
```bash
docker-compose ps
```

#### Option 2: Manual Installation

**PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-14

# macOS
brew install postgresql@14

# Start service
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS
```

**Redis:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start service
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

**Kafka:**
```bash
# Download Kafka
wget https://downloads.apache.org/kafka/3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka (in new terminal)
bin/kafka-server-start.sh config/server.properties
```

---

## 🏃 Running Services

### Step 1: Setup Auth Service (Current Directory)

You are currently in `gamingzone-auth` directory. Let's set it up first:

#### 1.1 Install Dependencies
```bash
npm install
```

#### 1.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/gamingzone_auth?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Service
PORT=4001
NODE_ENV="development"

# gRPC
GRPC_PORT=5001

# GraphQL
GRAPHQL_PLAYGROUND=true

# Kafka
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="gamingzone-auth"
KAFKA_GROUP_ID="gamingzone-auth-group"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

#### 1.3 Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed initial data
npx prisma db seed
```

#### 1.4 Start Auth Service
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

**Expected Output:**
```
[Nest] 12345  - 01/21/2026, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/21/2026, 10:30:45 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/21/2026, 10:30:45 AM     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 12345  - 01/21/2026, 10:30:45 AM     LOG [InstanceLoader] AuthModule dependencies initialized
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [RoutesResolver] AuthController {/api/auth}:
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [RouterExplorer] Mapped {/api/auth/register, POST} route
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [RouterExplorer] Mapped {/api/auth/login, POST} route
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [GraphQLModule] GraphQL playground: http://localhost:4001/graphql
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [NestMicroservice] gRPC Server listening on port 5001
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG Application is running on: http://localhost:4001
[Nest] 12345  - 01/21/2026, 10:30:46 AM     LOG Swagger documentation: http://localhost:4001/api/docs
```

### Step 2: Setup Other Services

Follow similar steps for each service:

#### 2.1 Catalog Service
```bash
cd ../gamingzone-catalog
npm install
cp .env.example .env
# Edit .env with appropriate values
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### 2.2 Order Service
```bash
cd ../gamingzone-order
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### 2.3 Payment Service
```bash
cd ../gamingzone-payment
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### 2.4 Inventory Service
```bash
cd ../gamingzone-inventory
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### 2.5 Notification Service
```bash
cd ../gamingzone-notification
npm install
cp .env.example .env
npm run start:dev
```

### Service Health Check

Verify all services are running:

```bash
# Auth Service
curl http://localhost:4001/health

# Catalog Service
curl http://localhost:4002/health

# Order Service
curl http://localhost:4003/health

# Payment Service
curl http://localhost:4004/health

# Inventory Service
curl http://localhost:4005/health

# Notification Service
curl http://localhost:4006/health
```

---

## 🧪 Testing APIs

### Using Swagger UI (Recommended for Beginners)

Each service has Swagger documentation:

- **Auth Service:** http://localhost:4001/api/docs
- **Catalog Service:** http://localhost:4002/api/docs
- **Order Service:** http://localhost:4003/api/docs
- **Payment Service:** http://localhost:4004/api/docs
- **Inventory Service:** http://localhost:4005/api/docs

### Using GraphQL Playground

- **Auth Service:** http://localhost:4001/graphql
- **Catalog Service:** http://localhost:4002/graphql
- **Order Service:** http://localhost:4003/graphql

### Using cURL

#### 1. Register a New User

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response:**
```json
{
  "id": "01933e7f-8b2a-7890-b123-456789abcdef",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "ACTIVE",
  "createdAt": "2026-01-21T10:30:00.000Z"
}
```

#### 2. Login

```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "01933e7f-8b2a-7890-b123-456789abcdef",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### 3. Get User Profile (Protected Route)

```bash
# Save the access token from login response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:4001/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 4. Create a Role (Admin Only)

```bash
curl -X POST http://localhost:4001/api/roles \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PRODUCT_MANAGER",
    "description": "Can manage products and inventory"
  }'
```

#### 5. Browse Products (Public)

```bash
curl -X GET "http://localhost:4002/api/products?page=1&limit=10&category=games&platform=PS5"
```

#### 6. Create an Order (Protected)

```bash
curl -X POST http://localhost:4003/api/orders \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "sku": "PS5-GOW-RAGNAROK",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "phone": "+212600000000",
      "address": "123 Main St",
      "city": "Casablanca",
      "country": "Morocco"
    }
  }'
```

### Using Postman

1. **Import Collection:**
   - Download the Postman collection from `docs/postman/GamingZone.postman_collection.json`
   - Import into Postman

2. **Set Environment Variables:**
   - `BASE_URL`: http://localhost:4001
   - `ACCESS_TOKEN`: (will be set automatically after login)

3. **Run Requests:**
   - Start with "Auth > Register"
   - Then "Auth > Login" (saves token automatically)
   - Test other endpoints

### Using GraphQL

#### Register User (GraphQL)

```graphql
mutation RegisterUser {
  register(input: {
    email: "jane.smith@example.com"
    password: "SecurePassword123!"
    firstName: "Jane"
    lastName: "Smith"
  }) {
    id
    email
    firstName
    lastName
    createdAt
  }
}
```

#### Login (GraphQL)

```graphql
mutation Login {
  login(input: {
    email: "jane.smith@example.com"
    password: "SecurePassword123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

#### Query User Profile (GraphQL)

```graphql
query GetMe {
  me {
    id
    email
    firstName
    lastName
    roles {
      id
      name
      description
    }
  }
}
```

**Note:** Add Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🧪 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Integration Tests

```bash
# Run integration tests
npm run test:e2e
```

### Test Specific Files

```bash
# Test a specific file
npm run test -- user.repository.spec.ts

# Test a specific suite
npm run test -- --testNamePattern="UserRepository"
```

### Expected Test Output

```
 PASS  test/unit/use-cases/register-user.use-case.spec.ts
 PASS  test/unit/use-cases/login.use-case.spec.ts
 PASS  test/unit/domain/entities/user.entity.spec.ts
 PASS  test/unit/infrastructure/repositories/user.repository.spec.ts
 PASS  test/integration/auth.e2e-spec.ts

Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        8.234 s
Ran all test suites.

Coverage:
  Statements   : 87.5% ( 350/400 )
  Branches     : 82.3% ( 141/171 )
  Functions    : 85.7% ( 120/140 )
  Lines        : 88.2% ( 338/383 )
```

---

## 📊 Monitoring & Debugging

### View Logs

```bash
# View real-time logs
tail -f logs/application.log

# View error logs only
tail -f logs/error.log

# Search logs
grep "ERROR" logs/application.log
```

### Database Inspection

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

Access at: http://localhost:5555

### Redis Inspection

```bash
# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# Get specific key
GET cart:01933e7f-8b2a-7890-b123-456789abcdef

# Monitor real-time commands
MONITOR
```

### Kafka Inspection

```bash
# List all topics
kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume messages from topic
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic user.events \
  --from-beginning
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4001
```

**Solution:**
```bash
# Find process using port
lsof -i :4001

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=4011
```

### Issue 2: Database Connection Failed

**Error:**
```
Error: Can't reach database server at localhost:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -U postgres -h localhost
```

### Issue 3: Prisma Client Not Generated

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Generate Prisma Client
npx prisma generate

# If still fails, reinstall
rm -rf node_modules
npm install
npx prisma generate
```

### Issue 4: Kafka Connection Timeout

**Error:**
```
KafkaJSConnectionError: Connection timeout
```

**Solution:**
```bash
# Check if Kafka is running
docker ps | grep kafka

# Restart Kafka
docker-compose restart kafka

# Check Kafka logs
docker-compose logs kafka
```

---

## 📚 Additional Resources

### API Documentation

- **Swagger UI:** http://localhost:4001/api/docs
- **GraphQL Playground:** http://localhost:4001/graphql
- **Postman Collection:** `docs/postman/`

### Architecture Documentation

- **Clean Architecture:** `docs/CLEAN_ARCHITECTURE.md`
- **DDD Principles:** `docs/DDD_PRINCIPLES.md`
- **Event Sourcing:** `docs/EVENT_SOURCING.md`

### Development Guides

- **Contributing:** `CONTRIBUTING.md`
- **Code Style:** `docs/CODE_STYLE.md`
- **Git Workflow:** `docs/GIT_WORKFLOW.md`

---

## 🎯 Next Steps

1. ✅ **Setup Infrastructure** (PostgreSQL, Redis, Kafka)
2. ✅ **Run Auth Service** (Current directory)
3. ⬜ **Run Other Services** (Catalog, Order, Payment, Inventory)
4. ⬜ **Test APIs** (Swagger, Postman, cURL)
5. ⬜ **Setup API Gateway** (Kong/NGINX)
6. ⬜ **Deploy to Production** (Docker, Kubernetes)

---

## 📞 Support

- **Documentation:** https://docs.gamingzone.com
- **Issues:** https://github.com/gamingzone/issues
- **Discord:** https://discord.gg/gamingzone
- **Email:** support@gamingzone.com

---

**Made with ❤️ by the GamingZone Team**

