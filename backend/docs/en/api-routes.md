
# 🛣️ Detailed Description of Endpoints and API Routes

This document details the main endpoints of the DigitalLetter API, the available HTTP methods, and basic usage examples.

---

| Resource          | Base URL                | Methods          | Description                           |
| ----------------- | ----------------------- | ---------------- | ------------------------------------- |
| Categories        | `/api/categories/`      | GET, POST, PUT, PATCH, DELETE | Category CRUD                        |
| Products          | `/api/products/`        | GET, POST, PUT, PATCH, DELETE | CRUD for products, linked to categories |
| Employees         | `/api/employe/`         | GET, POST, PATCH  | Management of users with `employe` role |
| Clients           | `/api/clients/`         | GET, POST, PATCH  | Management of users with `client` role  |
| Authentication    | `/api/token/`           | POST             | Login with JWT                       |
| Current user      | `/api/me/`              | GET, PATCH        | Authenticated user profile           |
| Change password   | `/api/change-password/` | POST             | Change user password                 |

---

## Basic usage examples

### Get list of categories

```http
GET /api/categories/
Accept: application/json
```

Response:

```json
[
  {
    "id": 1,
    "name": "Entrantes"
  },
  {
    "id": 2,
    "name": "Postres"
  }
]
```

---

### Create a new category with translation

```http
POST /api/categories/
Content-Type: application/json

{
  "translations": {
    "es": {"name": "Bebidas"},
    "en": {"name": "Drinks"}
  }
}
```

Response:

```json
{
  "id": 3,
  "name": "Bebidas"
}
```

---

### JWT Authentication

```http
POST /api/token/
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

Response:

```json
{
  "access": "token_jwt",
  "refresh": "token_refresh"
}
```

---

### Get authenticated user profile

```http
GET /api/me/
Authorization: Bearer token_jwt
```

Response:

```json
{
  "id": 5,
  "username": "usuario",
  "email": "usuario@ejemplo.com",
  "role": "client"
}
```
