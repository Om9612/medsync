"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicine_controller_1 = require("../controllers/medicine.controller");
const router = (0, express_1.Router)();
router.get('/', medicine_controller_1.getMedicines); // list all
router.post('/', medicine_controller_1.createMedicine); // add new
router.put('/:id', medicine_controller_1.updateMedicine); // edit
router.delete('/:id', medicine_controller_1.deleteMedicine); // remove
router.post('/:id/take', medicine_controller_1.takeMedicine); // mark taken
exports.default = router;
