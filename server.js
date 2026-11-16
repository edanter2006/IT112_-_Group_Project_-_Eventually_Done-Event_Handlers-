const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const reservationsRouter = require("./routes/reservations");
const checklistsRouter = require("./routes/checklists");
const authRoutes = require('./routes/authRoutes');

const app = express();

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,                  // 5 requests per IP
    message: { message: 'Too many requests, try again later' }
});

// Apply rate limiter to login
app.use('/api/auth/login', limiter);

const helmet = require('helmet');
app.use(helmet());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// XSS Sanitization
const xss = require('xss');

function sanitizeData(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeData(obj[key]);
        }
    }
}

app.use((req, res, next) => {
    if (req.body) sanitizeData(req.body);
    if (req.query) {
        try { sanitizeData(req.query); } catch (e) {}
    }
    if (req.params) sanitizeData(req.params);
    next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/checklists", checklistsRouter);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Database connection & Server start
async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Startup error:", err.message);
        process.exit(1);
    }
}

start();