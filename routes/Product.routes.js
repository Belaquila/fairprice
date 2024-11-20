const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model.js');

// GET: Retrieve all products
router.get('/products', (req, res, next) => {
    Product.find()
      .populate('cost_elements.cost_element')
      .then((products) => {
        res.json(products);
      })
      .catch(next);
  });
  
  // POST: Create a new product
  router.post('/products', (req, res, next) => {
    const { name, base_quantity, cost_elements, unit_total_cost, unit_price } = req.body;
    const product = new Product({ name, base_quantity, cost_elements, unit_total_cost, unit_price });
  
    product
      .save()
      .then((savedProduct) => {
        res.status(201).json(savedProduct);
      })
      .catch(next);
  });
  
  // PUT: Update an existing product
  router.put('/products/:id', (req, res, next) => {
    const updates = { ...req.body };
    Product.findByIdAndUpdate(req.params.id, updates, { new: true })
      .then((updatedProduct) => {
        if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
      })
      .catch(next);
  });
  
  // DELETE: Delete a product
  router.delete('/products/:id', (req, res, next) => {
    const { id } = req.params;
  
    Product.findByIdAndDelete(id)
      .then((deletedProduct) => {
        if (!deletedProduct) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).send();
      })
      .catch(next);
  });
  
  module.exports = router;