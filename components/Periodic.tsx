import { useEffect, useState } from 'react';

function Periodic({ children, interval }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, interval);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [interval]);

  // Render the children with the current time
  return children(time);
}

export default Periodic;