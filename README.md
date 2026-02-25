# Product API

This repository is a simple Node.js/Express application that provides a RESTful API
for managing products stored in a MongoDB database.  It demonstrates the use of
modern JavaScript features (ES modules), `mongoose` for data modeling, and basic
pagination, aggregation and CRUD operations.

---

## 🗂️ Project Structure

```text
index.js                    # Application entry point
config/db.js                # MongoDB connection helper
controllers/
  product.controller.js     # Route handlers for products
models/
  product.model.js          # Mongoose schema for products
routes/
  product.routes.js         # Express router defining API endpoints
```

- **index.js**: bootstraps the server, loads environment variables, applies
  middleware (CORS and JSON body parsing), and registers the `/products`
  router.
- **config/db.js**: connects to the database using the ``MONGO_URI`` from
  environment.
- **product.model.js**: defines `Product` with embedded `variants` and `reviews`
  sub‑documents, plus virtuals and indexes for performance.
- **product.controller.js**: contains all business logic for listing,
  creating, updating, deleting products, adding reviews, and updating stock.
- **product.routes.js**: wires controller functions to REST endpoints.

---

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the root with:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/mydb
   ```

3. Run the server:
   ```bash
   pnpm start
   # or: node index.js
   ```

4. The API will be available at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Path                    | Description                            |
|--------|-------------------------|----------------------------------------|
| GET    | `/products`             | List products (paginated)              |
| POST   | `/products`             | Create a new product                   |
| GET    | `/products/:id`         | Retrieve a single product by ID        |
| PUT    | `/products/:id`         | Update a product                       |
| DELETE | `/products/:id`         | Delete a product                       |
| POST   | `/products/:id/reviews` | Add a review to a product              |
| PATCH  | `/products/:id/stock`   | Update stock for a specific SKU        |


### Pagination

`GET /products` supports `page` and `limit` query parameters. The response
includes a `pagination` object with totals and current page info.

---

## 🛠️ Technologies Used

- Node.js (ES modules)
- Express.js
- MongoDB & Mongoose
- CORS & dotenv

---

## ✅ Additional Notes

- `product.model.js` defines a virtual property `avgRating` calculated from
  embedded reviews.
- Indexes on `{ category, name }` and on `variants.sku` (unique, sparse) help
  with query performance and SKU uniqueness.
- Error handling in controllers returns appropriate HTTP status codes and
  messages.

Feel free to extend the codebase with authentication, validation, or a front‑end
client!

---

## 🧠 Detailed Code Overview

### config/db.js
This async helper reads `MONGO_URI` from the environment and uses
`mongoose.connect()` to establish the connection. In case the variable is
missing or the connection fails, it logs an error but does not terminate the
process. Successful connection is confirmed by a console message.

### models/product.model.js
- **Variant Schema**: Embedded subdocument without its own `_id`, containing
  SKU, color, price, and stock. Stock is non-negative and defaults to `0`.
- **Review Schema**: Also embedded and _id-less; stores a reference to the user
  (`userId`), a rating between 1 and 5, and an optional comment. Timestamps are
  enabled so each review has `createdAt`/`updatedAt`.
- **Product Schema**: Top-level document with `name`, `category`, and arrays of
  variants and reviews. Timestamps are on the product level as well.
- **Virtuals**: `avgRating` computes the average review score at read time and
  is included when converting documents to JSON/Object.
- **Indexes**: Compound index on category+name to speed up filtered searches and
  a sparse unique index on `variants.sku` to enforce SKU uniqueness only when
  variants exist.

### controllers/product.controller.js
Each exported function corresponds to an API action:

1. **getProducts**
   - Reads `page`/`limit` from query string, applies `skip`/`limit` on the
     `Product.find()` result sorted by creation date (newest first).
   - Returns both the matching documents and pagination metadata (`totalProducts`,
     `totalPages`, etc.).
2. **createProduct**
   - Constructs a new `Product` from `req.body` and saves it. Responds with
     `201 Created` on success.
3. **getProductById**
   - Fetches a product by its Mongo `_id`; 404 if not found.
4. **updateProduct**
   - Uses `findByIdAndUpdate` with `runValidators` so schema rules apply to
     updates. Returns the updated document.
5. **deleteProduct**
   - Removes the document and returns confirmation plus the deleted object.
6. **addReview**
   - Pushes a new review into `reviews` array using `$push`; returns the updated
     product with status `201`.
7. **updateStock**
   - Atomically increments (`$inc`) the `stock` field of a specific variant
     identified by SKU. Handles the case where either product or SKU is missing.
8. **getStats**
   - Aggregates products by category, unwinds variants, and computes:
     * total stock per category, * average rating (across all reviews), * count
     of distinct products.  The pipeline gracefully handles products without
     reviews by returning `null` for `avgRating`.

Error handling generally catches exceptions and responds with a `500` or `400`
as appropriate, including the error message for debugging.

### routes/product.routes.js
Express router maps HTTP methods and paths to controller functions. The
`/stats` route is defined before the dynamic `/:id` route to avoid path
collision. All routes use path parameters or JSON body payloads as required.

### index.js
Loads environment variables (`dotenv`), creates the Express app, and configures
CORS and JSON parsing middleware. Calls `connectDB()` before setting up routes to
ensure the database is available. Finally, it defines a simple root endpoint and
starts listening on the `PORT` from the environment (default 3000).

---

With these details in place, the README now gives readers both high-level
context and low-level understanding of how each piece works together.
