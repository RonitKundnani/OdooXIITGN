const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.post("/attendance/check-in", attendanceController.checkIn);
router.post("/attendance/check-out", attendanceController.checkOut);
router.get("/attendance/today", attendanceController.getTodayStatus);
router.get("/attendance", attendanceController.getAllAttendance);
router.post("/attendance", attendanceController.upsertAttendance);
router.put("/attendance/:id", attendanceController.upsertAttendance);
router.delete("/attendance/:id", attendanceController.deleteAttendance);

module.exports = router;
