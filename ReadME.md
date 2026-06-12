# Urbn Way — Streetwear E‑commerce
[![Live Demo](https://img.shields.io/badge/live-demo-brightgreen)](https://urb4n-way.netlify.app/)


Urbn Way is a full-stack streetwear e-commerce application developed as the final group project of a Full Stack Web Development course. The app allows users to browse and filter products stored in a database, manage favorites and cart, register, complete a checkout flow, and subscribe to a mailing list.

>  **Backend note**
> The backend API is deployed to Render. Render services enter sleep mode after 15 minutes of inactivity; when the API is cold, expect a 20–30 second delay for the first request while the service wakes up.


---

## Key Features

- Product catalog with categories, search and filters
- Product detail pages with variants (sizes)
- Wishlist and shopping cart management
- User registration and checkout flow
- Order creation and email subscription

---

## Tech Stack

- Frontend
  - React 19.0.0
  - Vite 6.2.0
  - React Router DOM 7 (for routing and navigation)
  - UI libraries: Swiper for carousels, Bootstrap Icons
  - EmailJS for contact / mailing-list integration
  - Axios for API requests

- Backend
  - Node.js + Express
  - MySQL (mysql2) as relational database
  - Utility libs: slugify, validator, cors

---

## Live Demo
[Urb4n Way](https://urb4n-way.netlify.app)

## How to run locally

1. Clone the repository
   ```bash
   git clone https://github.com/willymariino/fullstack-project-final
   cd fullstack-project-final
   ```

2. Backend setup

   ```bash
   cd ecommerce-express
   npm install
   ```

   Create a `.env` file with the required database credentials and environment variables.

3. Start the backend server

   ```bash
   npm run dev
   ```

4. Frontend setup

   ```bash
   cd ../ecommerce-react
   npm install
   npm run dev
   ```

5. Open the application at the address provided by Vite.

---

## Team 

This project was a group final project completed over multiple weeks with milestone-based progress and periodic presentations to two instructors acting as project managers. At the end of each milestone the team presented progress; after the final milestone the team presented the completed project illustrating features and operation.

Team members
- [Willy Mariino](https://github.com/willymariino)
- [Marco Vacchi](https://github.com/MarcoVacchi)
- [Andrea Catapano](https://github.com/AndreaCatapano)
- [Martino Lanza](https://github.com/martinolanza03)
- [Simone Burrai](https://github.com/simoneburrai)
- [Raffaele Coppola](https://github.com/raff-E12)

---

## How we worked

- Project split into weekly milestones with clear deliverables 
- At the end of each milestone the team demonstrated the current state to two instructors who acted as project managers and provided feedback.
- Iterative improvements and bug fixes between milestones until the final presentation.

---


