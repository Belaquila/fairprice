const express = require('express');
const router = express.Router();
const CostElement = require('../models/CostElement.model.js');

// GET: Retrieve all cost elements
router.get('/cost-elements', (req, res, next) => {
  CostElement.find()
    .then((costElements) => {
      res.json(costElements);
    })
    .catch(next); // Pass error to error handler
});

// POST: Create a new cost element
router.post('/cost-elements', (req, res, next) => {
  const { name, category, cost_type } = req.body;
  const costElement = new CostElement({ name, category, cost_type });

  costElement
    .save()
    .then((savedCostElement) => {
      res.status(201).json(savedCostElement);
    })
    .catch(next);
});

// PUT: Update an existing cost element
router.put('/cost-elements/:id', (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  CostElement.findByIdAndUpdate(id, updates, { new: true })
    .then((updatedCostElement) => {
      if (!updatedCostElement) {
        return res.status(404).json({ message: 'CostElement not found' });
      }
      res.json(updatedCostElement);
    })
    .catch(next);
});

// DELETE: Delete a specific cost element
router.delete('/cost-elements/:id', (req, res, next) => {
  const { id } = req.params;

  CostElement.findByIdAndDelete(id)
    .then((deletedCostElement) => {
      if (!deletedCostElement) {
        return res.status(404).json({ message: 'CostElement not found' });
      }
      res.status(204).send();
    })
    .catch(next);
});

module.exports = router;