import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  handleCreateEntry,
  handleGetUserEntries,
  handleUpdateEntry,
  handleDeleteEntry,
} from "../controllers/entry.controller.js";

const router = Router();

router.post("/", requireAuth, handleCreateEntry);
router.get("/", requireAuth, handleGetUserEntries);
router.put("/:id", requireAuth, handleUpdateEntry);
router.delete("/:id", requireAuth, handleDeleteEntry);

export default router;