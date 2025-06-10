"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var mongoose_1 = require("mongoose");
var dotenv = require("dotenv");
var auth_1 = require("./routes/auth");
var user_1 = require("./routes/user");
dotenv.config();
var app = express();
app.use(cors({
    origin: 'https://cyber-frontend-imyf1qv18-abdoulmerlics-projects.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(function () { return console.log('Connected to MongoDB'); })
    .catch(function (err) { return console.error('MongoDB connection error:', err); });
var PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
