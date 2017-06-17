import Transform3d  from 'transform3d';
import { cubicOut } from 'eases-jsnext';

export default function transform( node,
				   {
				     easing = cubicOut,
				     scaleX = 1,
				     scaleY = 1,
				     scaleZ = 1,
				     rotateX = 0,
				     rotateY = 0,
				     rotateZ = 0,
				     translateX = 0,
				     translateY = 0,
				     translateZ = 0,				    
				     delay = 0,
				     duration = 400 }) {
  
  const el = getComputedStyle(node,null);
  const tr  =
	  el.getPropertyValue("-webkit-transform") ||
	  el.getPropertyValue("-moz-transform") ||
	  el.getPropertyValue("-ms-transform") ||
	  el.getPropertyValue("-o-transform") ||
	  el.getPropertyValue("transform");

  let or = '';
  let matrix = '';
  
  if(tr == '' || tr == "none") {
    or = new Transform3d().matrix3d();
  } else {
    
    if(/^matrix3d.*/.test(tr)) {
      matrix = tr.substr(9,tr.length-10).split(", ").map(parseFloat);
    } else {
      matrix = tr.substr(7,tr.length-7).split(", ").map(parseFloat);
    }
    if(matrix.length==6) {
      matrix = [
	matrix[0],
	matrix[1],
	0,
	0,
	matrix[2],
	matrix[3],
	0,
	0,
	0,
	0,
	1,
	0,
	matrix[4],
	matrix[5],
	0,
	1];
    }
    if(matrix.length!==16) {
      or = new Transform3d().matrix3d();
    } else {
      or = new Transform3d().matrix3d(matrix[0],
				      matrix[1],
				      matrix[2],
				      matrix[3],
				      matrix[4],
				      matrix[5],
				      matrix[6],
				      matrix[7],
				      matrix[8],
				      matrix[9],
				      matrix[10],
				      matrix[11],
				      matrix[12],
				      matrix[13],
				      matrix[14],
				      matrix[15] );
    }
  }
  const to = new Transform3d().
	  scaleX(scaleX).
	  scaleY(scaleY).
	  scaleZ(scaleZ).
	  rotateX(rotateX).
	  rotateY(rotateY).
	  rotateZ(rotateZ).
	  translateX(translateX).
	  translateY(translateY).
	  translateZ(translateZ);
  
  const interpolation = new Transform3d.Interpolation( to, or );
  
  return {
    delay,
    duration,
    easing,
    css: t =>
      `-webkit-transform: ${interpolation.step(t).compose()};` +
      `-moz-transform: ${interpolation.step(t).compose()};` +
      `-ms-transform: ${interpolation.step(t).compose()};` +
      `-o-transform: ${interpolation.step(t).compose()};` +      
      `transform: ${interpolation.step(t).compose()};`            
  };
}
