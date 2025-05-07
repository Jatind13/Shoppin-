import React, { useState } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import ProductCard from './ProductCard';
import './SwipeableCards.css';   

const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const SwipeableCards = ({ products }) => {
  const [gone, setGone] = useState(new Set());
  const [swipedProducts, setSwipedProducts] = useState({
    liked: [],
    disliked: [],
  });

  const [springs, api] = useSprings(products.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useDrag(({ args: [index], active, movement: [mx, my], direction: [xDir, yDir], velocity }) => {
    const trigger = velocity > 0.2;
  
    if (!active && trigger) {
      gone.add(index);
      const product = products[index];
  
      if (yDir < 0) {
        // Swiped up - increase cart count
        console.log('Added to cart:', product.name);
        // Implement your cart logic here
      } else if (xDir > 0) {
        // Swiped right - liked
        setSwipedProducts((prev) => ({
          ...prev,
          liked: [...prev.liked, product],
        }));
        console.log('Liked:', product.name);
      } else {
        // Swiped left - disliked
        setSwipedProducts((prev) => ({
          ...prev,
          disliked: [...prev.disliked, product],
        }));
        console.log('Disliked:', product.name);
      }
  
      // Remove the product from the stack
      setTimeout(() => {
        setGone(new Set([...gone])); // Update gone state
      }, 600);
    }
  
    api.start((i) => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0;
      const y = isGone ? (200 + window.innerHeight) * yDir : active ? my : 0; // Handle vertical movement
      const rot = mx / 100 + (isGone ? xDir * 10 * velocity : 0);
      const scale = active ? 1.1 : 1;
  
      return {
        x,
        y,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      };
    });
  });
  
  return (
    <div className="card-stack">
      {springs.map((props, i) => {
        const isGone = gone.has(i);
        return (
          <animated.div key={i} style={{ transform: interpolate([props.rot, props.scale], trans), x: props.x, y: props.y }}>
            <animated.div
              {...bind(i)}
              style={{
                transform: interpolate([props.rot, props.scale], trans),
                touchAction: 'none',
              }}
              className={`${props.x.to(x => x > 50 ? 'swiping-right' : x < -50 ? 'swiping-left' : '')}`}
            >
              <ProductCard product={products[i]} />
              {isGone && (
                <div className="swipe-icon">
                  {props.x.get() > 50 ? <i class="fa-solid fa-thumbs-up like-icon"></i> : <i class="fa-solid fa-thumbs-down dislike-icon"></i>}
                </div>
              )}
            </animated.div>
          </animated.div>
        );
      })}

      {springs.length === 0 && (
        <div className="no-more-cards">
          <h2>No more products to show!</h2>
          <p>You liked: {swipedProducts.liked.length} products</p>
        </div>
      )}
    </div>
  );
};

export default SwipeableCards;
