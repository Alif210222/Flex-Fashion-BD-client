# Flex-Fashion BD 👕
### Modern Clothing & Fashion E-Commerce Platform

Flex-Fashion BD is a full-stack clothing e-commerce platform designed to provide customers with a smooth and convenient online shopping experience. Customers can explore clothing collections, choose product variants, manage their carts, and place Cash on Delivery (COD) orders.

The platform also includes a dedicated admin dashboard where administrators can manage products, upload product images, and handle customer orders.

## 🌐 Live Website

**Frontend:** https://flexfashionbd.com




---

## 📌 Project Overview

Flex-Fashion BD is built to support a real-world clothing business with two main user experiences:

- **Customer:** Browse products, add items to cart, place orders, and track order progress.
- **Admin:** Manage products, monitor orders, and update order statuses through a dedicated dashboard.

The platform supports both guest shopping and authenticated customer shopping, making the purchasing experience more accessible.

## ✨ Key Features

### 🛍️ Customer Features

- **User Authentication**
  - Customer registration and login.
  - Secure JWT-based authentication.
  - Role-based access control.
  - Login-aware navigation.

- **Product Browsing**
  - Browse all available products.
  - Explore products by category.
  - Search products by keyword.
  - Sort products by newest, oldest, and price.
  - Paginated product listing.
  - View featured products and new collections.

- **Product Details**
  - View detailed product information.
  - Product image gallery.
  - Select available sizes and colors.
  - View product pricing and discount information.
  - Check product variant availability and stock.
  - Select product quantity.

- **Shopping Cart**
  - Add products to cart.
  - Update product quantities.
  - Remove individual cart items.
  - Clear the entire cart.
  - Automatically calculate subtotal and item count.
  - Validate product availability and stock.
  - Guest cart support using browser local storage.
  - Separate cart management for authenticated customers.

- **Checkout & Orders**
  - Guest and authenticated customer checkout.
  - Collect customer name, phone number, and delivery address.
  - Place Cash on Delivery (COD) orders.
  - View order confirmation.
  - Access personal order history.
  - View individual order details.
  - Track order status and progress.

- **Customer Account**
  - View profile information.
  - Access personal orders.
  - Manage the shopping experience through an account dropdown.

### 🔐 Admin Features

- **Admin Dashboard**
  - Dedicated protected admin dashboard.
  - Admin-only routes and authorization.
  - Overview of product and order management.

- **Product Management**
  - Add new products.
  - Upload product images to Cloudinary.
  - Preview product information.
  - Edit existing products.
  - Delete products.
  - Manage product prices and compare-at prices.
  - Manage product sizes, colors, SKU, and stock.
  - Set product categories and tags.
  - Mark products as featured.
  - Manage product status (Draft, Active, Archived).
  - View product inventory and product counts.

- **Order Management**
  - View all customer orders.
  - View customer information.
  - Access order details.
  - Review ordered products and quantities.
  - Update order statuses.
  - Manage order progress from the admin dashboard.

- **Security**
  - Protected admin routes.
  - JWT token verification.
  - Role-based authorization.
  - Server-side validation.

---

## 🧰 Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Frontend UI development |
| React Router | Client-side routing |
| Tailwind CSS | Styling and responsive design |
| shadcn/ui | UI components |
| TanStack Query | Server-state management |
| Axios | API communication |
| React Hook Form | Form management |
| Zod | Form validation |
| Lucide React | Icons |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend REST API |
| MongoDB | Database |
| Mongoose | Database modeling |
| JSON Web Token (JWT) | Authentication |
| Cloudinary | Product image storage |
| Zod | Request validation |

### Deployment & Services

| Service | Purpose |
|---|---|
| Vercel | Frontend and backend deployment |
| MongoDB Atlas | Cloud database |
| Cloudinary | Image hosting |
| Git & GitHub | Version control |

---

## 🏗️ Project Architecture

The application follows a client-server architecture.

```text
                 FLEX-FASHION BD
                        |
          +-------------+-------------+
          |                           |
      Frontend                    Backend API
       (React)                    (Express.js)
          |                           |
          |                       Middleware
          |                           |
          |                    Authentication
          |                           |
          |                     Controllers
          |                           |
          |                       Services
          |                           |
          |                        Models
          |                           |
          |                    MongoDB Atlas
          |
     Customer UI
     Admin Dashboard
     Shopping Cart
     Checkout
```

### Main Backend Modules

- Authentication Module
- Product Module
- Cart Module
- Order Module

The backend uses a modular structure to keep routes, controllers, services, models, validations, and middleware organized and maintainable.

---

## 🔄 Shopping & Order Workflow

### Guest Customer

1. Visit the website without creating an account.
2. Browse products and view product details.
3. Select size, color, and quantity.
4. Add products to the guest cart.
5. Guest cart data is stored in browser local storage.
6. Proceed to checkout.
7. Submit delivery information.
8. Place a Cash on Delivery order.

### Authenticated Customer

1. Register or log in.
2. Browse and select products.
3. Add products to the authenticated cart.
4. Proceed to checkout.
5. Submit the order.
6. View order history and order details.

### Admin

1. Log in using an admin account.
2. Access the protected dashboard.
3. Add, update, or delete products.
4. Upload product images.
5. View customer orders.
6. Update order statuses.

---

## 📂 Environment Variables

Configure the following environment variables before running the project.

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

**Important:** Never commit your actual environment variables, database credentials, JWT secrets, or Cloudinary API secrets to GitHub.

---

## 🚀 Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd flex-fashion-bd
```

### 3. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file and configure the required environment variables.

Start the backend development server:

```bash
npm run dev
```

### 4. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file and configure the backend API URL.

Start the frontend:

```bash
npm run dev
```

The frontend should now be available at:

```text
http://localhost:5173
```

*Note: Adjust the `server` and `client` directory names and npm scripts if your repository uses a different structure.*

---

## 🔒 Security & Validation

The application implements several security and data-validation practices:

- JWT-based authentication.
- Protected API endpoints.
- Role-based authorization for admin operations.
- Server-side request validation.
- Product and stock availability checks.
- Secure environment variable configuration.
- Backend-side order validation.

Product prices and stock should always be verified against database records when creating an order rather than trusting values submitted by the browser.

---

## 📱 Responsive Design

The frontend is designed to provide a consistent shopping experience across:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile devices.

The UI follows a minimal fashion-oriented design with a soft, creamy color palette and a clean layout.

---

## 🔮 Future Improvements

Potential future enhancements include:

- Online payment gateway integration.
- Product reviews and ratings.
- Coupon and discount management.
- Advanced product category management.
- Wishlist functionality.
- Order cancellation and return management.
- Inventory analytics.
- Sales reports and dashboard analytics.
- Email and SMS order notifications.

---

## 👨‍💻 Developer

**Md. Alif Sarker Rony**

Full-Stack Web Developer | MERN Stack Developer

- GitHub: https://github.com/Alif210222
- Portfolio: YOUR_PORTFOLIO_URL
- LinkedIn: YOUR_LINKEDIN_URL

---

## 📄 License

This project is developed for the Flex-Fashion BD clothing business.

All rights reserved unless otherwise specified.

---

**Built with ❤️ using the MERN Stack.**
