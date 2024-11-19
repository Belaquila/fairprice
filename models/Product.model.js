const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  manufacturing_time_seconds: { 
    type: Number, 
    required: true 
  },
  cost_elements: [
    {
      cost_element: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CostElement', 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
      unit: { 
        type: String, 
        required: true 
      }
    }
  ], // Array of objects containing reference to cost_element, quantity, and unit. The cost element can be grouped by category or cost_type (later).
  total_cost: { 
    type: Number, 
    required: true,
    default: 0 
  },
  price: { 
    type: Number, 
    required: true 
  },
});

module.exports = mongoose.model('Product', ProductSchema);
