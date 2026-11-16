const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);