import React, { useState } from 'react';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import ProductCard from './ProductCard';
import './SwipeableCards.css';

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
  `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const SwipeableCards = ({ products }) => {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [swipedProducts, setSwipedProducts] = useState({
    liked: [],
    disliked: []
  });

  // Create springs for each card
  const [springs, api] = useSprings(products.length, i => ({
    ...to(i),
    from: from(i),
  }));

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
    
    if (!active && trigger) {
      gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      
      // Update swiped products
      const product = products[index];
      if (xDir > 0) {
        // Swiped right - liked
        setSwipedProducts(prev => ({
          ...prev,
          liked: [...prev.liked, product]
        }));
        console.log('Liked:', product.name);
      } else {
        // Swiped left - disliked
        setSwipedProducts(prev => ({
          ...prev,
          disliked: [...prev.disliked, product]
        }));
        console.log('Disliked:', product.name);
      }
    }
    
    api.start(i => {
      if (index !== i) return; // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = mx / 100 + (isGone ? xDir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
      const scale = active ? 1.1 : 1; // Active cards lift up a bit
      
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      };
    });
    
    if (!active && gone.size === products.length) {
      // All cards have been swiped
      setTimeout(() => {
        gone.clear();
        api.start(i => to(i));
        console.log('Final results:', swipedProducts);
      }, 600);
    }
  });

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once.
  return (
    <div className="card-stack">
      {springs.map((props, i) => (
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
          </animated.div>
        </animated.div>
      ))}
      
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
