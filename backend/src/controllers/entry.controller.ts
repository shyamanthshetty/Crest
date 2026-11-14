// src/controllers/entry.controller.ts
import { type Response } from "express";
import * as entryService from "../services/entry.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// ---------- CREATE ----------
export const handleCreateEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, date, mood, location, media, transactions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        error : "unauthorized"
      });
    }

    const entry = await entryService.createEntry({
      title,
      content,
      userId,
      date,
      mood,
      location,
      media,
      transactions,
    });

    return res.status(201).json({
      message: "Journal entry created successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------- READ ----------
export const handleGetUserEntries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const entries = await entryService.getUserEntries(userId);

    return res.status(200).json({
      message: "Entries retrieved successfully",
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------- UPDATE ----------
export const handleUpdateEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Entry ID is required" });
    }

    const { title, content, date, mood, location, media, transactions } = req.body;

    const updated = await entryService.updateEntry(id, userId, {
      title,
      content,
      date,
      mood,
      location,
      media,
      transactions,
    });

    return res.status(200).json({
      message: "Entry updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating entry:", error);

    if (error.message === "Entry not found or unauthorized") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------- DELETE ----------
export const handleDeleteEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Entry ID is required" });
    }

    await entryService.deleteEntry(id, userId);

    return res.status(200).json({
      message: "Entry deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting entry:", error);

    if (error.message === "Entry not found or unauthorized") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};