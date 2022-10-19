import React, { useRef, useEffect, useState } from 'react';

type Point = {
    x: number;
    y: number;
};

type Line = {
    startPoint: Point;
    endPoint: Point;
}

function DrawingArea() {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const[lineStartPoint, setLineStartPoint] = useState<Point | null>(null);
  const[lineEndPoint, setLineEndPoint] = useState<Point | null>(null);
  const[lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
  const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    // canvas.width = window.innerWidth * 2;
    // canvas.height = window.innerHeight * 2;
    // canvas.style.width = `${window.innerWidth *2}`;
    // canvas.style.height = `${window.innerHeight *2}`; 
    
    const context = canvas.getContext('2d');
    // context!.scale(2,2);
    context!.lineCap = "round";
    context!.strokeStyle ="black";
    context!.lineWidth = 5;
    canvasCtxRef.current = canvas.getContext('2d');

    }, []);

    useEffect(() => {
     if(lineStartPoint && lineEndPoint) {
        let newLine: Line = {startPoint: lineStartPoint,
                          endPoint: lineEndPoint}
        drawLine(newLine);
       

        let intersections : Point[] = [];
        lines.forEach(line => {
           let intersection: Point | null = calculateIntersection(newLine, line);
           if (intersection) {
            intersections.push(intersection);
           }
        })

        console.log(intersections);
        intersections.forEach(intersection => drawPoint(intersection));
        setLines([...lines, newLine]);
     } 
    }, [lineStartPoint, lineEndPoint]);


  const getClientOffset = (event: any) => {
    const {pageX, pageY} = event.touches ? event.touches[0] : event;
  
    const x: number = canvasRef.current ? pageX - canvasRef.current.offsetLeft : pageX;
    const y: number = canvasRef.current ? pageY - canvasRef.current.offsetTop : pageY;
    return {x, y};
   }

  const onMouseClick = (nativeEvent: any) => {
    const point = getClientOffset(nativeEvent);
    if (!lineStartPoint) {
        setLineStartPoint(point)
      } else if (lineStartPoint && !lineEndPoint) {
        setLineEndPoint(point);
      }
   }
   const onMouseMove =(nativeEvent:any)=> {
    if(!lineStartPoint){
      return;
    }
    if (!canvasCtxRef.current) {
      return;
     }
    const {offSetX,offSetY} = nativeEvent;
    const line : Line = {
      startPoint : lineStartPoint,
      endPoint : { x : offSetX, y: offSetY}
    }
    drawLine(line);
    console.log("mousemove")
   }

  const drawLine = (line: Line) => {
    if (!canvasCtxRef.current) {
     return;
    }
    console.log(canvasCtxRef.current);
    canvasCtxRef.current.beginPath();
    canvasCtxRef.current.moveTo(line.startPoint.x, line.startPoint.y);
    canvasCtxRef.current.lineTo(line.endPoint.x, line.endPoint.y);
    canvasCtxRef.current.stroke();
    canvasCtxRef.current.closePath();
    
    setLineStartPoint(null);
    setLineEndPoint(null);
  }

  const drawPoint= (point: Point) => {
    if (!canvasCtxRef.current) {
        return;
       }
  let color = '#FF0000';
  let size = 5;
  // to increase smoothing for numbers with decimal part
  var pointX = Math.round(point.x);
  var pointY = Math.round(point.y);

  canvasCtxRef.current.beginPath();
  canvasCtxRef.current.fillStyle = color;
  canvasCtxRef.current.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
  canvasCtxRef.current.fill();
}

  const calculateIntersection = (line1: Line, line2: Line) => {
    var c2x = line2.startPoint.x - line2.endPoint.x; // (x3 - x4)
    var c3x = line1.startPoint.x - line1.endPoint.x; // (x1 - x2)
    var c2y = line2.startPoint.y - line2.endPoint.y; // (y3 - y4)
    var c3y = line1.startPoint.y - line1.endPoint.y; // (y1 - y2)

    var d  = c3x * c2y - c3y * c2x;

    if (d === 0) {
        return null;
    }

    var u1 = line1.startPoint.x * line1.endPoint.y - line1.startPoint.y * line1.endPoint.x; // (x1 * y2 - y1 * x2)
    var u4 = line2.startPoint.x * line2.endPoint.y - line2.startPoint.y * line2.endPoint.x; // (x3 * y4 - y3 * x4)



    var px = (u1 * c2x - c3x * u4) / d;
    var py = (u1 * c2y - c3y * u4) / d;

    var p: Point = { x: px, y: py };

    return p;
}

  return (
    <div style={{
        width: "550px",
        height:"600px",
        border: "solid 1px black",
      }}>
        <button onClick={() => collapsed()}
        style={{
          border: " 1px solid red",
          marginLeft: "30px;"
        }}
        >Collapse Lines</button>
    <canvas
     onMouseDown={onMouseClick}
    //  onMouseMove={onMouseMove}
     ref ={canvasRef}
     width= "500px"
     height="500px"
     style={{
       border: "1px solid red",
       margin: "20px;"
     }}></canvas>
     </div>
     
  );
}

export default DrawingArea;

function collapsed(): void {
    throw new Error('Function not implemented.');
  }