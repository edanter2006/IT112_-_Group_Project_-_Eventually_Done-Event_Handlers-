const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    tasks: { type: String, trim: true },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model("Checklist", checklistSchema);