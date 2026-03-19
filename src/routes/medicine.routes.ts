import { Router } from 'express';
import {
  getMedicines, createMedicine,
  updateMedicine, deleteMedicine, takeMedicine
} from '../controllers/medicine.controller';

const router = Router();

router.get('/',          getMedicines);    // list all
router.post('/',         createMedicine);  // add new
router.put('/:id',       updateMedicine);  // edit
router.delete('/:id',    deleteMedicine);  // remove
router.post('/:id/take', takeMedicine);    // mark taken

export default router;