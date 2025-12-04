# User CRUD Application with SOLID Principles

This NestJS application demonstrates a complete CRUD implementation following SOLID principles.

## SOLID Principles Implementation

### 1. **Single Responsibility Principle (SRP)**
Each class has one reason to change:
- **UserEntity**: Represents the user domain model
- **UserRepository**: Handles data persistence only
- **UsersService**: Contains business logic only
- **UsersController**: Handles HTTP requests/responses only

### 2. **Open/Closed Principle (OCP)**
- Classes are open for extension but closed for modification
- Can add new features using decorators, pipes, guards without changing existing code
- Can extend DTOs using PartialType, PickType, etc.

### 3. **Liskov Substitution Principle (LSP)**
- Repository implements IUserRepository interface
- Any implementation of IUserRepository can replace UserRepository without breaking the application

### 4. **Interface Segregation Principle (ISP)**
- `IUserRepository` defines only methods needed for user data operations
- DTOs are specific to their use case (CreateUserDto vs UpdateUserDto)

### 5. **Dependency Inversion Principle (DIP)**
- UsersService depends on `IUserRepository` interface, not concrete implementation
- Dependency injection through constructor and `@Inject` decorator
- Repository is bound to interface in the module

## Project Structure

```
src/users/
├── controllers/
│   └── users.controller.ts      # HTTP layer
├── services/
│   └── users.service.ts          # Business logic layer
├── repositories/
│   └── user.repository.ts        # Data access layer
├── entities/
│   └── user.entity.ts            # Domain model
├── dto/
│   ├── create-user.dto.ts        # Create operation DTO
│   └── update-user.dto.ts        # Update operation DTO
├── interfaces/
│   └── user-repository.interface.ts  # Repository contract
└── users.module.ts               # Module configuration
```

## API Endpoints

### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "age": 30
}
```

### Get All Users
```http
GET /users
```

### Get User by ID
```http
GET /users/:id
```

### Update User
```http
PATCH /users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "age": 31,
  "isActive": false
}
```

### Delete User
```http
DELETE /users/:id
```

## Running the Application

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start the application
npm run start:dev
```

The application will be available at `http://localhost:3000`

## Features

- ✅ Complete CRUD operations
- ✅ Input validation using class-validator
- ✅ Email uniqueness check
- ✅ Proper error handling (NotFoundException, ConflictException)
- ✅ Dependency injection
- ✅ Clean architecture with separation of concerns
- ✅ Type-safe Prisma ORM integration

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","age":25}'

# Get all users
curl http://localhost:3000/users

# Get user by ID
curl http://localhost:3000/users/{id}

# Update user
curl -X PATCH http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete user
curl -X DELETE http://localhost:3000/users/{id}
```
