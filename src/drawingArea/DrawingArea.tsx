import React, { useRef, useEffect, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

type Line = {
  startPoint: Point;
  endPoint: Point;
}

const DrawingArea = () => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [lineStartPoint, setLineStartPoint] = useState<Point | null>(null);
  const [lineEndPoint, setLineEndPoint] = useState<Point | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const step: number = 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    const context = canvas.getContext('2d');
    context!.lineCap = "round";
    context!.strokeStyle = "black";
    context!.lineWidth = 5;
    canvasCtxRef.current = canvas.getContext('2d');
  }, []);

  useEffect(() => {
    if (lineStartPoint && lineEndPoint) {
      let newLine: Line = {
        startPoint: lineStartPoint,
        endPoint: lineEndPoint
      }
      drawLineWithIntersections(newLine);
      setLineStartPoint(null);
      setLineEndPoint(null);
    }
  }, [lineStartPoint, lineEndPoint]);

  const getClientOffset = (event: any) => {
    const { pageX, pageY } = event.touches ? event.touches[0] : event;
    const x: number = canvasRef.current ? pageX - canvasRef.current.offsetLeft : pageX;
    const y: number = canvasRef.current ? pageY - canvasRef.current.offsetTop : pageY;
    return { x, y };
  }

  const stopDrawing = () => {
    canvasCtxRef!.current!.closePath();
    redrawArea();
    setLineEndPoint(null);
    setLineStartPoint(null);
  }

  const onMouseClick = (nativeEvent: any) => {
    if (!canvasCtxRef.current) {
      return;
    }

    const { x, y } = getClientOffset(nativeEvent);
    if (!lineStartPoint) {
      canvasCtxRef.current.beginPath();
      canvasCtxRef.current.moveTo(x, y);
      setLineStartPoint({ x, y });
    } else if (lineStartPoint && !lineEndPoint) {
      canvasCtxRef.current.closePath();
      redrawArea();
      setLineEndPoint({ x, y });
    }
  }

  const onMouseMove = (event: any) => {
    if (!lineStartPoint) {
      return;
    }

    const { x, y } = getClientOffset(event);
    canvasCtxRef!.current!.lineTo(x, y);
    canvasCtxRef!.current!.stroke();
  }

  const redrawArea = () => {
    canvasCtxRef!.current!.clearRect(0, 0, canvasRef!.current!.width, canvasRef!.current!.height);
    let lineArr: Line[] = lines;
    setLines([]);
    lineArr.forEach(newLine => {
      drawLineWithIntersections(newLine);
    })
  }

  const drawLineWithIntersections = (newLine: Line) => {
    drawLine(newLine);
    let intersections: Point[] = [];
    lines.forEach(line => {
      let intersection: Point | null = calculateIntersection(newLine, line);
      if (intersection) {
        intersections.push(intersection);
      }
    })
    intersections.forEach(intersection => drawPoint(intersection));
    setLines([...lines, newLine]);
  }

  const drawLine = (line: Line) => {
    if (!canvasCtxRef.current) {
      return;
    }
    canvasCtxRef.current.beginPath();
    canvasCtxRef.current.moveTo(line.startPoint.x, line.startPoint.y);
    canvasCtxRef.current.lineTo(line.endPoint.x, line.endPoint.y);
    canvasCtxRef.current.stroke();
    canvasCtxRef.current.closePath();
  }

  const drawPoint = (point: Point) => {
    if (!canvasCtxRef.current) {
      return;
    }
    let color = '#FF0000';
    let size = 5;
    let pointX = Math.round(point.x);
    let pointY = Math.round(point.y);

    canvasCtxRef.current.beginPath();
    canvasCtxRef.current.fillStyle = color;
    canvasCtxRef.current.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
    canvasCtxRef.current.fill();
  }

  const calculateIntersection = (line1: Line, line2: Line) => {
    let c2x = line2.startPoint.x - line2.endPoint.x;
    let c3x = line1.startPoint.x - line1.endPoint.x;
    let c2y = line2.startPoint.y - line2.endPoint.y;
    let c3y = line1.startPoint.y - line1.endPoint.y;

    let d = c3x * c2y - c3y * c2x;

    if (d === 0) {
      return null;
    }

    let u1 = line1.startPoint.x * line1.endPoint.y - line1.startPoint.y * line1.endPoint.x;
    let u4 = line2.startPoint.x * line2.endPoint.y - line2.startPoint.y * line2.endPoint.x;

    let px = (u1 * c2x - c3x * u4) / d;
    let py = (u1 * c2y - c3y * u4) / d;

    let p: Point = { x: px, y: py };

    return p;
  }

  const getLineCenter = (line: Line) => {
    let x = (line.startPoint.x + line.endPoint.x) / 2;
    let y = (line.startPoint.y + line.endPoint.y) / 2;
    return { x, y };
  }

  const getNewCoordinate = (oldCoordinate: number,
    centerCoordinate: number,
    step: number) => {
    if (oldCoordinate === centerCoordinate) {
      return oldCoordinate;
    } else if (oldCoordinate > centerCoordinate) {
      return oldCoordinate - step;
    } else {
      return oldCoordinate + step;
    }
  }

  const getLineLength = (line: Line) => {
    let x = Math.pow((line.endPoint.x - line.startPoint.x), 2)
    let y = Math.pow((line.endPoint.y - line.startPoint.y), 2)
    return Math.sqrt(x + y);
  }

  const collapsed = (): void => {
    lines.forEach(line => {
      let centerPoint: Point = getLineCenter(line);
      line.startPoint.x = getNewCoordinate(line.startPoint.x, centerPoint.x, 1)
      line.startPoint.y = getNewCoordinate(line.startPoint.y, centerPoint.y, 1)
      line.endPoint.x = getNewCoordinate(line.endPoint.x, centerPoint.x, 1)
      line.endPoint.y = getNewCoordinate(line.endPoint.y, centerPoint.y, 1)
      redrawArea()
      if (getLineLength(line) > 1) {
        setTimeout(() => { requestAnimationFrame(collapsed) }, 500)
      }
    })
  }

  return (
    <div style={{
      width: "550px",
      height: "600px",
      border: "solid 1px black",
    }}>
      <button onClick={collapsed}
        style={{
          border: " 1px solid red",
          marginLeft: "30px;"
        }}
      > Collapse Lines </button>
      <canvas
        onClick={onMouseClick}
        onContextMenu={stopDrawing}
        onMouseMove={onMouseMove}
        ref={canvasRef}
        width="500px"
        height="500px"
        style={{
          border: "1px solid red",
          margin: "20px;"
        }}></canvas>
    </div>

  );
}

export default DrawingArea;
