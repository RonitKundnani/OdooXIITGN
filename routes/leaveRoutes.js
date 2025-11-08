const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");

router.get("/leave-types", leaveController.getLeaveTypes);
router.get("/leave-allocations", leaveController.getLeaveAllocations);
router.get("/leave-requests", leaveController.getLeaveRequests);
router.post("/leave-requests", leaveController.applyLeave);
router.put("/leave-requests/:id", leaveController.updateLeaveStatus);
router.delete("/leave-requests/:id", leaveController.cancelLeaveRequest);

module.exports = router;
