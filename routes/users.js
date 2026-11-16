const router = require("express").Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Middleware to restrict access by role
function requireRole(rolesArray) {
    return (req, res, next) => {
        if (!req.user || !rolesArray.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied: Insufficient permissions." });
        }
        next();
    };
}

// CREATE (Register/Add User)
router.post("/", async (req, res) => {
    try {
        const user = await User.create(req.body);
        return res.status(201).json(user);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// READ ALL (Admin Only)
router.get("/", protect, requireRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        return res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user accounts." });
    }
});

// UPDATE USER ROLE (Admin Only)
router.patch("/:id/role", protect, requireRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'organizer', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { role }, 
            { new: true, select: "-password" }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.json({ message: "Role updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating user role." });
    }
});

// GENERAL UPDATE
router.put("/:id", protect, requireRole(['admin']), async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, select: "-password" });
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete("/:id", protect, requireRole(['admin']), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.json({ message: "User deleted" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

module.exports = router;