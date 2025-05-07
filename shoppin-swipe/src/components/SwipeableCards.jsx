import React, { useState, useEffect } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import ProductCard from './ProductCard';
import './SwipeableCards.css';   

const to = (i) => ({
  x: 0,
  y: i * -10, 
  scale: 1 - (i * 0.05), 
  rot: -2.002 + Math.random() * 4,
  delay: i * 100,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const SwipeableCards = ({ products }) => {
  // Create a copy of the products array - removed the reverse() call to fix ordering
  const [remainingProducts, setRemainingProducts] = useState([...products]);
  
  const [gone] = useState(() => new Set());
  const [swipedProducts, setSwipedProducts] = useState({
    liked: [],
    disliked: [],
  });
  
  // Add cart counter state
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const [springs, api] = useSprings(remainingProducts.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  // Update springs when remainingProducts changes
  useEffect(() => {
    api.start((i) => {
      if (i < remainingProducts.length) {
        return { ...to(i), from: from(i) };
      }
      return undefined; // Return undefined for indices beyond the array length
    });
  }, [remainingProducts.length, api]);

  const bind = useDrag(({ args: [index], active, movement: [mx, my], direction: [xDir, yDir], velocity }) => {
    const trigger = velocity > 0.2;
    const dir = xDir < 0 ? 'left' : xDir > 0 ? 'right' : yDir < 0 ? 'up' : 'down';
    const isGone = !active && trigger;
    
    // Only process if this is an actual swipe action and card isn't already gone
    if (isGone && !gone.has(index)) {
      gone.add(index);
      const product = remainingProducts[index];
      
      // Handle different swipe directions
      if (dir === 'up') {
        // Swiped up - add to cart
        console.log('Added to cart:', product.name);
        setCartCount(prevCount => prevCount + 1);
        setCartItems(prevItems => [...prevItems, product]);
      } else if (dir === 'right') {
        // Swiped right - liked
        setSwipedProducts(prev => ({
          ...prev,
          liked: [...prev.liked, product],
        }));
        console.log('Liked:', product.name);
      } else if (dir === 'left') {
        // Swiped left - disliked
        setSwipedProducts(prev => ({
          ...prev,
          disliked: [...prev.disliked, product],
        }));
        console.log('Disliked:', product.name);
      }
      
      // Immediately remove the product from remainingProducts
      setRemainingProducts(prev => prev.filter((_, i) => i !== index));
    }
    
    // Update the spring animation for this card
    api.start(i => {
      if (index !== i) return; // Only animate the current card
      
      const isCardGone = gone.has(index);
      
      // Calculate movement values
      const x = isCardGone ? (200 + window.innerWidth) * (dir === 'right' ? 1 : -1) : active ? mx : 0;
      const y = isCardGone && dir === 'up' ? -window.innerHeight : active ? my : 0;
      const rot = mx / 100 + (isCardGone ? (dir === 'right' ? 1 : -1) * 10 * velocity : 0);
      const scale = active ? 1.1 : 1;
      
      return {
        x,
        y,
        rot,
        scale,
        config: { friction: 50, tension: active ? 800 : isCardGone ? 200 : 500 },
      };
    });
  });
  
  return (
    <div className="swipeable-container">
      {/* Cart counter display */}
      <div className="cart-counter">
        <i className="fas fa-shopping-cart"></i>
        <span>{cartCount}</span>
      </div>
      
      <div className="card-stack">
        {springs.map((props, i) => {
          if (i >= remainingProducts.length) return null;
          
          return (
            <animated.div key={i} style={{ 
              position: 'absolute',
              x: props.x,
              y: props.y,
              transform: interpolate([props.rot, props.scale], trans)
            }}>
              <animated.div
                {...bind(i)}
                style={{
                  touchAction: 'none',
                }}
                className="card"
              >
                <ProductCard product={remainingProducts[i]} />
                
                {/* Display icons based on swipe direction */}
                <animated.div 
                  className="swipe-icon like-icon" 
                  style={{ opacity: props.x.to(x => (x > 50 ? 1 : 0)) }}
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                </animated.div>
                
                <animated.div 
                  className="swipe-icon dislike-icon" 
                  style={{ opacity: props.x.to(x => (x < -50 ? 1 : 0)) }}
                >
                  <i className="fa-solid fa-thumbs-down"></i>
                </animated.div>
                
                <animated.div 
                  className="swipe-icon cart-icon" 
                  style={{ opacity: props.y.to(y => (y < -50 ? 1 : 0)) }}
                >
                  <i className="fa-solid fa-cart-plus"></i>
                </animated.div>
              </animated.div>
            </animated.div>
          );
        })}

        {remainingProducts.length === 0 && (
          <div className="no-more-cards">
            <h2>No more products to show!</h2>
            <p>You liked: {swipedProducts.liked.length} products</p>
            <p>Items in cart: {cartCount}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeableCards;
