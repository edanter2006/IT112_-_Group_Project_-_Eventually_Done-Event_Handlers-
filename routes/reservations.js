const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all reservations
router.get("/", protect, async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("user_id", "username email role")
            .sort({ createdAt: -1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a reservation
router.post("/", protect, async (req, res) => {
    try {
        const newReservation = await Reservation.create({
            ...req.body,
            user_id: req.user._id
        });
        res.status(201).json(newReservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE reservation status (Admin & Organizer only)
router.put("/:id/status", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a reservation (Admin & Organizer only)
router.delete("/:id", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: "Reservation deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;