# Ecommerce Chat Helper

An AI-powered ecommerce platform with a chat assistant for customer support and product management. The system integrates a React frontend, a Node.js backend with LangChain agents, and a Python-based chatbot.

## Features

- **AI Chat Assistant**: Powered by Google Gemini AI and LangChain for intelligent customer interactions
- **User Authentication**: JWT-based authentication with role-based access (buyer, seller, admin)
- **MongoDB Integration**: Persistent storage for users, products, and conversation states
- **Real-time Chat**: Interactive chat widget for customer support
- **Course Lookup Tool**: Search and recommend courses from the database
- **Customer Information Saving**: Collect and store customer details during conversations

## Tech Stack

### Frontend
- React.js
- CSS (custom styling)

### Backend
- Node.js
- Express.js
- TypeScript
- LangChain (for AI agents)
- Google Generative AI (Gemini)
- MongoDB (with Mongoose-like integration)

### Chatbot
- Python
- Custom functions for file operations, calculations, etc.

### Database
- MongoDB

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud instance)
- Google AI API Key (for Gemini model)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ecommerce-chat-helper
   ```

2. **Set up the server**:
   ```bash
   cd server
   npm install
   ```

3. **Set up the client**:
   ```bash
   cd ../client
   npm install
   ```

4. **Set up the chatbot (optional)**:
   ```bash
   cd ../chat-bot
   pip install -r requirements.txt  # If requirements.txt exists
   ```

5. **Environment Variables**:
   Create a `.env` file in the `server` directory with:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/craftify
   JWT_SECRET=your-jwt-secret-here
   GOOGLE_API_KEY=your-google-api-key-here
   ```

## Usage

1. **Start MongoDB**:
   Ensure MongoDB is running on your system or update `MONGO_URI` for a cloud instance.

2. **Seed the database (optional)**:
   ```bash
   cd server
   npm run seed
   ```

3. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:8000`.

4. **Start the client**:
   ```bash
   cd client
   npm start
   ```
   The client will run on `http://localhost:3000`.

5. **Access the application**:
   - Open `http://localhost:3000` in your browser
   - Register/Login as a user
   - If logged in as seller/admin, access the dashboard to add products
   - Use the chat widget for AI assistance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product (seller/admin only)
- `PUT /api/products/:id` - Update a product (seller/admin only)
- `DELETE /api/products/:id` - Delete a product (seller/admin only)

### Chat
- `POST /api/chat` - Send a message to the AI agent

## Project Structure

```
ecommerce-chat-helper/
├── chat-bot/              # Python chatbot scripts
│   ├── calculator/        # Calculator functions
│   ├── functions/         # Utility functions
│   └── main.py            # Main chatbot logic
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── agents/        # LangChain agents and tools
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Main server file
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

- **MongoDB Connection Issues**: Ensure MongoDB is running and `MONGO_URI` is correct.
- **API Key Errors**: Verify your Google API key is valid and set in `.env`.
- **Port Conflicts**: If ports 3000 or 3001 are in use, update the server/client configs.
- **Recursion Limit**: The AI agent is optimized to limit recursions to 3 per request to prevent infinite loops.

For more help, check the LangChain documentation or open an issue in the repository.
