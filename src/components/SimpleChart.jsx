export function BarChart({ data, height = 200 }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-around gap-4" style={{ height: `${height}px` }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="w-full flex items-end justify-center" style={{ height: `${height - 40}px` }}>
            <div
              className="w-full bg-[#F2BED1] rounded-t-lg transition-all hover:bg-[#FDCEDF] relative group"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
            const y2 = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
              />
            );
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-700">{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
