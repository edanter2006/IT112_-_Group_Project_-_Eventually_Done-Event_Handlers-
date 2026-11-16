const express = require("express");
const router = express.Router();
const Checklist = require("../models/Checklist");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all checklists
router.get("/", protect, async (req, res) => {
    try {
        const checklists = await Checklist.find()
            .populate("user_id", "username email")
            .sort({ createdAt: -1 });
        res.json(checklists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a checklist (Admin & Organizer only)
router.post("/", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        const newChecklist = await Checklist.create({
            ...req.body,
            user_id: req.user._id
        });
        res.status(201).json(newChecklist);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE checklist status (Admin & Organizer only)
router.put("/:id/status", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Checklist.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a checklist (Admin & Organizer only)
router.delete("/:id", protect, authorize('admin', 'organizer'), async (req, res) => {
    try {
        await Checklist.findByIdAndDelete(req.params.id);
        res.json({ message: "Checklist deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;