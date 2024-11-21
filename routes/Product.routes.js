const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model.js');
const Cost = require('../models/Cost.model.js');

const { isAuthenticated } = require('../middleware/jwt.middleware.js');

// Protect all routes using jwtMiddleware
router.use(isAuthenticated);

// GET: Retrieve all products
router.get('/products', (req, res, next) => {
  Product.find()
    .populate('costs.cost')
    .then((products) => {
      res.json(products);
    })
    .catch(next);
});

// GET: Retrieve a product by ID
router.get('/products/:id', (req, res, next) => {
  const { id } = req.params; // Extract product ID from the URL

  Product.findById(id)
    .populate('costs.cost') // Populate the 'cost' field in 'costs' array
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product); // Send the product data as JSON response
    })
    .catch((error) => {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: 'Internal server error' });
    });
});


// POST: Create a new product
router.post('/products', (req, res, next) => {
  const { name, base_quantity, costs, unit_total_cost, unit_price } = req.body;
  const product = new Product({ name, base_quantity, costs, unit_total_cost, unit_price });

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

// This is to manipulate costs for each product

// Middleware to find a product by ID
const findProductById = (req, res, next) => {
  console.log("product ID = ",req.params.productId)
  Product.findById(req.params.productId)
    .populate("costs.cost")
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      req.product = product;
      next();
    })
    .catch((error) => next(error));
};

// GET: Retrieve a single cost from a product
router.get("/products/:productId/costs/:costId", findProductById, (req, res) => {
  const cost = req.product.costs.find(
    (c) => c.cost._id.toString() === req.params.costId
  );
  if (!cost) {
    return res.status(404).json({ message: "Cost not found in product" });
  }
  res.json(cost);
});

// POST: Add a new cost to a product
router.post("/products/:productId/costs", findProductById, (req, res, next) => {
  const { costId, quantity, unit } = req.body;

  if (!costId || !quantity || !unit) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  Cost.findById(costId)
    .then((cost) => {
      if (!cost) {
        return res.status(404).json({ message: "Cost not found" });
      }

      // Add the cost to the product
      req.product.costs.push({ cost: cost._id, quantity, unit });

      req.product
        .save()
        .then((updatedProduct) => res.status(201).json(updatedProduct))
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

// PUT: Update a single cost in a product
router.put("/products/:productId/costs/:costId", findProductById, (req, res, next) => {
  const { quantity, unit } = req.body;

  console.log(req.body)
  console.log(req.params.costId)
  console.log(req.product.costs)

  const cost = req.product.costs.find(
    (c) => c._id.toString() === req.params.costId
  );
  
  if (!cost) {
    return res.status(404).json({ message: "Cost not found in product" });
  }

  if (quantity !== undefined) cost.quantity = quantity;
  if (unit !== undefined) cost.unit = unit;

  req.product
    .save()
    .then((updatedProduct) => res.json(updatedProduct))
    .catch((error) => next(error));
});

// DELETE: Remove a cost from a product
router.delete("/products/:productId/costs/:costId", findProductById, (req, res, next) => {
  const costIndex = req.product.costs.findIndex(
    (c) => c._id.toString() === req.params.costId
  );

  if (costIndex === -1) {
    return res.status(404).json({ message: "Cost not found in product" });
  }

  req.product.costs.splice(costIndex, 1);

  req.product
    .save()
    .then((updatedProduct) => res.json(updatedProduct))
    .catch((error) => next(error));
});



module.exports = router;