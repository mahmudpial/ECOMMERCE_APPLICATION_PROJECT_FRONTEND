# Commercia – Modern E‑commerce Frontend

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-State_Management-ffb237)](https://pinia.vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646cff?logo=vite)](https://vitejs.dev/)

A clean, minimalist e‑commerce frontend built with **Vue 3** and **Pinia**.  
**Japanese minimalism** visual language with an **electric blue** accent.  
Fully responsive, dark/light mode ready, production‑optimised.

🔗 **Live preview** – *(add your deployed URL here)*

---

## ✨ Features

- 🧭 **Responsive navigation** – desktop menu + right‑slide mobile drawer
- 🌗 **Dark / Light mode** – system‑aware, persists user preference
- 🛒 **Shopping cart** – add/remove items, update quantities, see totals
- 📦 **Product listing** – grid view with category/brand filters, search, pagination
- 🔍 **Product detail** – image gallery, quantity selector, “buy now”, related products
- 📝 **Checkout flow** – address & contact form, delivery & payment selection, promo codes
- 👤 **User account** – profile management, order history, logout
- 🔐 **Authentication** – OTP‑based login & registration (mobile number / email)
- 📬 **Newsletter subscription** – integrated with backend API
- ♿ **Accessibility** – focus rings, semantic HTML, touch‑friendly targets

---

## 🎨 Design System

| Element        | Light Mode                     | Dark Mode                      |
| -------------- | ------------------------------ | ------------------------------ |
| Page background| `#F5F7FA`                      | `#0F1218`                      |
| Card background| `#FFFFFF`                      | `#1A1E26`                      |
| Primary text   | `#1A2A3A`                      | `#E8EDF2`                      |
| Accent colour  | `#0066FF`                      | `#3B82F6`                      |

- **Typography**: Headings & brand → **Sora**, Body & UI → **Plus Jakarta Sans**
- **Spacing & borders**: 8‑40px border‑radius, 1.5rem core spacing, light shadows
- **Animations**: subtle hover lifts, smooth drawer slide, fade‑in on scroll

---

## 🛠️ Tech Stack

| Area               | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | Vue 3 (Composition API)                         |
| Routing            | Vue Router 4                                    |
| State Management   | Pinia (auth, cart, customerAuth)                |
| Styling            | Scoped CSS + CSS variables + Tailwind (utils)   |
| HTTP Client        | Axios                                           |
| Build Tool         | Vite                                            |
| Fonts              | Google Fonts (Sora, Plus Jakarta Sans)          |

---

## 📁 Project Structure
commercia-frontend/
├── public/ # static assets
├── src/
│ ├── assets/ # images, fonts, etc.
│ ├── components/
│ │ ├── admin/ # admin components (Dashboard, Login, etc.)
│ │ ├── customer/ # ProductCard.vue
│ │ └── global/ # ErrorMessage, LoadingSpinner
│ ├── layout/ # AdminMaster.Vue, CustomerLayout.vue
│ ├── router/ # index.js (route definitions)
│ ├── stores/ # auth.js, cart.js, customerAuth.js
│ ├── utils/ # axios.js, customerCommerce.js (helpers)
│ ├── views/
│ │ ├── admin/ # Dashboard.vue, Login.vue
│ │ └── customer/ # Cart, Checkout, Home, Login, OrderHistory,
│ │ # OrderSuccess, ProductDetail, Products, Profile, Register
│ ├── App.vue
│ ├── main.js
│ ├── base.css # CSS variables & resets
│ └── main.css # entry point (imports base.css, Tailwind)
├── .editorconfig
├── .env
└── index.html


---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation



