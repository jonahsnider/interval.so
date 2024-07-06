export function areaProps() {
	return {
		type: 'linear' as const,
		strokeWidth: 2,
		fillOpacity: 0.15,
		strokeLinecap: 'round' as const,
		animationDuration: 500,
		activeDot: {
			fill: 'hsl(var(--foreground))',
		},
	};
}

export function yAxisProps() {
	return {
		allowDecimals: false,
		axisLine: false,
		tickLine: false,
		tickMargin: 0,
		tickSize: 16,
	};
}

export function xAxisProps() {
	return {
		axisLine: false,
		tickLine: false,
		tickMargin: 0,
		tickSize: 16,
	};
}

export function cartesianGridProps() {
	return {
		vertical: false,
	};
}

export function areaChartProps() {
	return {
		margin: {
			left: 0,
			// So the dot for point on cursor isn't cut off on the right
			right: 5,
			// So the dot for point on cursor isn't cut off on the top
			top: 5,
			bottom: 0,
		},
	};
}

export function tooltipProps() {
	return {
		cursor: { strokeWidth: 2 },
		isAnimationActive: false,
	};
}
