import express from "express";
import mongoose from "mongoose";
import Memory from "../db/memoryModel.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const memories = await Memory.find();
    res.status(200).json(memories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    //mongodb için geçerli bir id değilse
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: "Memory id is not valid" });
    } else {
      const memory = await Memory.findById(id);
      if (!memory) return;

      res.status(200).json(memory);
    }
  } catch (error) {
    res.status(404).json({ message: "Memory not found" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const memory = req.body;
    const createdMemory = await Memory.create({...memory, creatorId: req.creatorId});
    res.status(201).json(createdMemory);
  } catch (error) {
    res.json({ message: "Create memory failed" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    //mongodb için geçerli bir id değilse
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: "Memory id is not valid" });
    } else {

      const oldMemory = await Memory.findById(id)
      if(req.creatorId !== oldMemory.creatorId) return res.sendStatus(403)

      const { title, content, creator, image } = req.body;
      const updatedMemory = await Memory.findByIdAndUpdate(
        id,
        { title, content, creator, image, _id: id },
        { new: true }
      );
      res.status(200).json(updatedMemory);
    }
  } catch (error) {
    console.log(error.message);
    res.json({ message: "Update failed" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    //mongodb için geçerli bir id değilse
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: "Memory id is not valid" });
    } else{
        const oldMemory = await Memory.findById(id)
        if(req.creatorId !== oldMemory.creatorId) return res.sendStatus(403)
        await Memory.findByIdAndDelete(id)
        res.status(200).json({message: 'Memory has been deleted'})
    }
  } catch (error) {
      console.log(error.message);
      res.json({message: 'Memory delete failed'})
  }
});

export default router;
