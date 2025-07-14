import { useEffect, useRef, useState } from 'react';
import { gsap, TimelineMax, SlowMo, TweenLite } from 'gsap/all';
import '../index.css';

const MachineGunText = ({ text }) => {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        animateText();
        setHasAnimated(true);
      }
    }, { threshold: 0.5 });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const animateText = () => {
    const container = containerRef.current;
    const sentenceEndExp = /(\.|\?|!)$/g;
    const words = text.split(' ');
    const tl = new TimelineMax({ delay: 0, repeat: -1 }); // infinite loop
    let time = 0;

    container.innerHTML = ''; // reset DOM

    words.forEach((word) => {
      const isSentenceEnd = sentenceEndExp.test(word);
      const element = document.createElement('h3');
      element.textContent = word;
      container.appendChild(element);

      let duration = Math.max(0.5, word.length * 0.08);
      if (isSentenceEnd) duration += 0.6;

      TweenLite.set(element, { autoAlpha: 0, scale: 0, z: 0.01 });

      tl.to(element, duration, {
        scale: 1.2,
        ease: SlowMo.ease.config(0.25, 0.9)
      }, time)
        .to(element, duration, {
          autoAlpha: 1,
          ease: SlowMo.ease.config(0.25, 0.9, true)
        }, time);

      time += duration - 0.05;
      if (isSentenceEnd) time += 0.6;
    });
  };

  return (
    <div id="demo" ref={containerRef}></div>
  );
};

export default MachineGunText;