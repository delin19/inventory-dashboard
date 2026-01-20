import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://backend-nine-plum-90.vercel.app';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, currentStock, change) => {
    const newQuantity = currentStock + change;
    
    if (newQuantity < 0) return;

    try {
      setUpdatingIds(prev => new Set(prev).add(id));
      
      const response = await fetch(`${API_URL}/api/update-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newQuantity })
      });

      const data = await response.json();

      if (data.success) {
        setProducts(prev => 
          prev.map(p => p.id === id ? data.data : p)
        );
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err) {
      alert('Network error: Unable to update stock');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Smart Inventory Dashboard</h1>
          <p>Manage your retail store inventory in real-time</p>
        </header>

        <div className="product-grid">
          {products.map(product => {
            const isLowStock = product.stock < product.lowStockThreshold;
            const isUpdating = updatingIds.has(product.id);
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                className={`product-card ${isLowStock ? 'low-stock' : ''}`}
              >
                {isLowStock && (
                  <div className="alert-badge">
                    {isOutOfStock ? '🚨 OUT OF STOCK' : '⚠️ CRITICAL LOW STOCK'}
                  </div>
                )}

                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>

                  <div className="stock-info">
                    <div className="stock-row">
                      <span>Current Stock:</span>
                      <span className={`stock-value ${
                        isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok'
                      }`}>
                        {product.stock}
                      </span>
                    </div>
                    <div className="stock-row small">
                      <span>Threshold:</span>
                      <span>{product.lowStockThreshold}</span>
                    </div>
                  </div>

                  <div className="controls">
                    <button
                      onClick={() => updateStock(product.id, product.stock, -1)}
                      disabled={product.stock === 0 || isUpdating}
                      className="btn btn-decrease"
                    >
                      {isUpdating ? '...' : '−'}
                    </button>
                    <button
                      onClick={() => updateStock(product.id, product.stock, 1)}
                      disabled={isUpdating}
                      className="btn btn-increase"
                    >
                      {isUpdating ? '...' : '+'}
                    </button>
                  </div>

                  {isUpdating && (
                    <div className="updating-label">Updating...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="stats-footer">
          <div className="stat">
            <p>Total Products</p>
            <h3>{products.length}</h3>
          </div>
          <div className="stat">
            <p>Low Stock Items</p>
            <h3 className="orange">
              {products.filter(p => p.stock < p.lowStockThreshold).length}
            </h3>
          </div>
          <div className="stat">
            <p>Out of Stock</p>
            <h3 className="red">
              {products.filter(p => p.stock === 0).length}
            </h3>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;