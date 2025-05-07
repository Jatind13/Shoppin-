import React from 'react';
import { animated } from '@react-spring/web';
import './ProductCard.css';

const ProductCard = ({ product, style }) => {
  const { name, brand, price, originalPrice, discountPercentage, imageUrl } = product;
  
  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };
  
  return (
    <animated.div className="product-card" style={style}>
      <i className="fas fa-shopping-cart cart-icon"></i>
      <img src={imageUrl} alt={name} />
      <div className="card-content">
        <p className="brand-name">{brand}</p>
        <h2 className="product-title">{name}</h2>
        <div className="price-container">
          <span className="current-price">{formatPrice(price)}</span>
          {discountPercentage > 0 && (
            <>
              <span className="original-price">{formatPrice(originalPrice)}</span>
              <span className="discount">{discountPercentage}% OFF</span>
            </>
          )}
        </div>
      </div>
      
      {/* Swipe indicators */}
      <div className="swipe-indicators">
        <div className="like-indicator">LIKE</div>
        <div className="dislike-indicator">SKIP</div>
      </div>
    </animated.div>
  );
};

export default ProductCard;
