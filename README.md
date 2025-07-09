# GearUp Sports

A modern e-commerce web application for sports gear, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features
- User authentication and protected routes
- Product catalog and detailed product pages
- Shopping cart and wishlist management
- Checkout with UPI and Razorpay integration
- Admin panel for product and order management
- User profile and order history
- Responsive design with Tailwind CSS

## Technologies Used
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (for backend and authentication)
- [Razorpay](https://razorpay.com/) (for payments)

## Getting Started

### Prerequisites
- Node.js (v16 or above)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mandar1045/GearUp-Sports.git
   cd GearUp-Sports/project
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in your Supabase and payment keys.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Folder Structure
```
project/
  src/
    components/      # Reusable UI components
    context/         # React context providers (Auth, Cart, etc.)
    data/            # Static data (e.g., products)
    database/        # Database management logic
    pages/           # Page components (Home, Cart, Profile, etc.)
    types/           # TypeScript type definitions
    utils/           # Utility functions
  public/            # Static assets
  index.html         # Main HTML file
  ...
```

## Project Structure

```
project/
├── eslint.config.js           # ESLint configuration
├── index.html                 # Main HTML file
├── package.json               # Project metadata and dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig*.json             # TypeScript configuration files
├── vite.config.ts             # Vite build tool configuration
├── src/                       # Source code
│   ├── App.tsx                # Main React app component
│   ├── index.css              # Global styles
│   ├── main.tsx               # App entry point
│   ├── components/            # Reusable UI components
│   ├── context/               # React context providers (Auth, Cart, etc.)
│   ├── data/                  # Static data (e.g., products)
│   ├── database/              # Database management logic
│   ├── pages/                 # Page components (Home, Cart, Profile, etc.)
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility/helper functions
│   └── vite-env.d.ts          # Vite environment types
│
├── supabase/                  # Supabase migrations and config
│   └── migrations/            # SQL migration files
│
└── README.md                  # Project documentation
```

Each folder and file is organized to keep the codebase modular, maintainable, and scalable for future development.

## Usage
- Register or log in to start shopping.
- Browse products, add to cart or wishlist.
- Checkout securely using UPI or Razorpay.
- Admins can manage products and orders from the admin panel.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Contact
For questions or support, contact [mandar1045](https://github.com/mandar1045).
