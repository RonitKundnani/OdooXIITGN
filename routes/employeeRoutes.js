const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

router.get("/employees", employeeController.getAllEmployees);
router.get("/employees/:id", employeeController.getEmployeeById);
router.post("/employees", employeeController.addEmployee);
router.put("/employees/:id", employeeController.updateEmployee);

module.exports = router;
