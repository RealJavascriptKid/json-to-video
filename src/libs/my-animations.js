
import { useCurrentFrame, useVideoConfig, interpolate, spring,Easing } from "remotion";
import myEasings from "./my-easings.ts";


function wobble(){
  const frame = useCurrentFrame();
  const translate3d_1 = interpolate(frame, 
    [0, 15,30, 45, 60,75,100], 
    [0, -25,20, -15, 10,-5,0], {
    extrapolateRight: "clamp",
  });

  const rotate3d_4 = interpolate(frame, 
    [0, 15,30, 45, 60,75,100], 
    [0, -5, 3, -3,2,-1,0], {
    extrapolateRight: "clamp",
  });

  return {
    transform: `translate3d(${translate3d_1}%, 0, 0) rotate3d(0, 0, 1, ${rotate3d_4}deg)`
  }

}

function shakeX(){
  const frame = useCurrentFrame();
  const translate3d_1 = interpolate(frame, 
    [0,10,20,30,40,50,60,70,80,90,100], 
    [0,-10,10,-10,10,-10,10,-10,10,-10,0], {
    extrapolateRight: "clamp",
  });

  return {
    transform: `translate3d(${translate3d_1}px, 0, 0)`
  }

}

function shakeY(){  
  
  const frame = useCurrentFrame();
  const translate3d_1 = interpolate(frame, 
    [0,10,20,30,40,50,60,70,80,90,100], 
    [0,-10,10,-10,10,-10,10,-10,10,-10,0], {
    extrapolateRight: "clamp",
  });

  return {
    transform: `translate3d(0,${translate3d_1}px, 0)`
    // top:`${translate3d_1}px`,
    // left:`${translate3d_1}px`,
  }

}

function fall(){
 

  const frame = useCurrentFrame();

  const rotate = interpolate(frame, 
    [0,50,60,100], 
    [0,90,90,90], {
    extrapolateRight: "clamp",
  });  

  const translateX = interpolate(frame, 
    [0,50,60,100], 
    [0,0,0,200], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, 
    [0,50,60,100],  
    [1,1,1,0], {
    extrapolateRight: "clamp",
  });

  return {
    transform: `rotate(${rotate}deg) translateX(${translateX}px)`,
    opacity
  }

}




function easing(){
  const frame = useCurrentFrame();
  const interpolated = interpolate(frame, [0, 100], [0, 1], {
    easing: myEasings.easeInElastic,
    //easing: Easing.elastic, 
    //easing: Easing.bezier(0.55, 0, 1, 0.45),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    transform: `scale(${interpolated})`,
  }

}



export default {
  wobble,shakeX,shakeY,fall,easing
}