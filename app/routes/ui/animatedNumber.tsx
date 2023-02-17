import { useState, useEffect, useRef } from 'react';

interface Props {
  target: number,
  decimalPlaces?: number
}

export default function AnimatedNumber({target, decimalPlaces = 0}: Props) {    
    const [currentValue, setCurrentValue] = useState(0);      // cummulative value for the number (to avoid rounding errors)
    const [displayValue, setDisplayValue] = useState(0);      // number value which gets sent to screen (rounded per parms)
    const [targetValue, setTargetValue] = useState(target);   // number to climb to before stopping
    const [decimals, setDecimals] = useState(decimalPlaces);  // number of decimal places to show
    let addPerFrame = useRef(0);                              // increment the number by this amount each frame

    const [isActive, setIsActive] = useState(true);           // are we climbing or not?

    const DELAY = 10;
    const FRAMES = 100;    

    useEffect(() => {      

      // Set the target value.  The first time this component loads this will probably be 0,
      // the next time, should be the real value to climb to.
      if (target != targetValue) {
        setTargetValue(target);
        
        // Calculate the increment per frame.
        const add = (target / FRAMES);
        addPerFrame.current = add;        

        setIsActive(true);    // start the timer
      }
    }, [target]);


    useEffect(() => {

        let interval:any = null;
        if (isActive && !interval) {
          interval = setInterval(() => {            
            if (currentValue <= targetValue) {                  

              // calculate cummulative values  
              let newValue = currentValue + addPerFrame.current;                
              setCurrentValue(newValue);

              // round the number for display
              let newDisplayValue = parseFloat(newValue.toFixed(decimals));
              setDisplayValue(newDisplayValue);
            }
            else {              
              // climbing is done, stop the timer
              setIsActive(false);              
            }
          }, DELAY);
        } 
        
        if (!isActive) {
          clearInterval(interval);
        }

        return () => clearInterval(interval);
      }, [currentValue, isActive]);

    return (
        <span>
          {
            displayValue.toLocaleString("en-US")
          }
        </span>
    )
}