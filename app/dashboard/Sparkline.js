// Pure SVG line chart from an array of numeric prices — no client JS or
// chart library needed, renders fine as a server component.
export default function Sparkline({ prices, width = 120, height = 36, positive }) {
  if (!prices || prices.length < 2) {
    return <div style={{ width, height }} />;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const color = positive ? "#00c896" : "#e5484d";
  const areaPoints = [`0,${height}`, ...points, `${width},${height}`].join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polygon points={areaPoints} fill={color} opacity="0.1" />
      <polyline points={points.join(" ")} stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}
