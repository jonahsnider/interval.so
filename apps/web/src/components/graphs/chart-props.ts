type Props = {
	color: 'primary';
};

export function areaProps({ color }: Props) {
	return {
		type: 'linear' as const,
		stroke: `hsl(var(--${color}))`,
		strokeWidth: 2,
		fill: `hsl(var(--${color}))`,
		fillOpacity: 0.15,
		strokeLinecap: 'round' as const,
		animationDuration: 500,
	};
}

export function yAxisProps() {
	return {
		stroke: 'var(--chart-accent-1)',
		allowDecimals: false,
		axisLine: false,
		tickLine: false,
		fontSize: 12,
		tickMargin: 0,
		tickSize: 16,
		strokeWidth: 2,
	};
}

export function xAxisProps() {
	return {
		stroke: 'var(--chart-accent-1)',
		axisLine: false,
		tickLine: false,
		tickMargin: 0,
		tickSize: 16,
		fontSize: 12,
	};
}

export function cartesianGridProps() {
	return {
		vertical: false,
		stroke: 'var(--chart-accent-2)',
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
		cursor: { strokeWidth: 2, stroke: 'hsl(var(--foreground))' },
		isAnimationActive: false,
	};
}
