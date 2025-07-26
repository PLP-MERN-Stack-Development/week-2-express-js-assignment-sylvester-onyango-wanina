// server.js - Final Express server for Week 2 assignment

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// ---------- Custom Middleware ----------

// Logger middleware: logs method, URL, and timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware: checks for API key in headers
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'mysecretkey') {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});

// ---------- Sample in-memory products database ----------
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// ---------- Routes ----------

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - List products with search, filter, and pagination
app.get('/api/products', (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;

  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: filteredProducts.length,
    products: paginatedProducts
  });
});

// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  product.name = name;
  product.description = description;
  product.price = price;
  product.category = category;
  product.inStock = inStock;

  res.json(product);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const deletedProduct = products.splice(index, 1);
  res.json(deletedProduct[0]);
});

// GET /api/products/stats - Get product count by category
app.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach(product => {
    const category = product.category.toLowerCase();
    stats[category] = (stats[category] || 0) + 1;
  });

  res.json({
    totalCategories: Object.keys(stats).length,
    countByCategory: stats
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;