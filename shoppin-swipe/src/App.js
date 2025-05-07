import React from 'react';
import Header from './components/Header';
import SwipeableCards from './components/SwipeableCards';
import { products } from './data/products';
import './App.css';

// Add Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoppingCart, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
library.add(faShoppingCart);
library.add(faThumbsUp)
library.add(faThumbsDown)

function App() {
  return (
    <div className="app-container">
      <Header />
      <SwipeableCards products={products} />
    </div>
  );
}

export default App;
