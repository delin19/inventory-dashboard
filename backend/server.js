const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());


let products = [
  { id: 1, name: 'Wireless Mouse', price: 29.99, stock: 15, lowStockThreshold: 10 },
  { id: 2, name: 'USB-C Cable', price: 12.99, stock: 5, lowStockThreshold: 8 },
  { id: 3, name: 'Laptop Stand', price: 45.00, stock: 3, lowStockThreshold: 5 },
  { id: 4, name: 'Mechanical Keyboard', price: 89.99, stock: 20, lowStockThreshold: 7 },
  { id: 5, name: 'Webcam HD', price: 65.00, stock: 2, lowStockThreshold: 4 },
  { id: 6, name: 'Monitor 24"', price: 199.99, stock: 12, lowStockThreshold: 6 },
  { id: 7, name: 'Desk Lamp', price: 34.50, stock: 8, lowStockThreshold: 10 },
  { id: 8, name: 'External SSD 1TB', price: 120.00, stock: 1, lowStockThreshold: 3 },
];


app.get('/api/products', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, data: products });
  }, 300);
});

app.post('/api/update-stock', (req, res) => {
  const { id, newQuantity } = req.body;

  if (id === undefined || newQuantity === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id and newQuantity'
    });
  }

  if (newQuantity < 0) {
    return res.status(400).json({
      success: false,
      error: 'Stock quantity cannot be negative'
    });
  }

  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  products[productIndex].stock = newQuantity;

  setTimeout(() => {
    res.json({
      success: true,
      data: products[productIndex]
    });
  }, 200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});