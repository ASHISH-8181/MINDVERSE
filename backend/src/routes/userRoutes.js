const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/**
 * @route POST /api/users/create
 * @desc Create a new user
 * @body { username, email, password }
 */
router.post("/create", userController.createUser);

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID with their files
 */
router.get("/:userId", userController.getUser);

module.exports = router;
