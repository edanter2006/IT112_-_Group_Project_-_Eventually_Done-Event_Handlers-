const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all items
router.get("/", protect, async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE an item (Admin & Organizer only)
router.post("/", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        const newItem = await Item.create(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE an item (Admin & Organizer only)
router.delete("/:id", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;