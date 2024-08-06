'use client';
import { motion, useAnimate } from 'framer-motion';
import { useCallback, useEffect } from 'react';

type Props = {
	className?: string;
};

export function HeroGraphic({ className }: Props) {
	return (
		<svg
			viewBox='0 0 1280 964'
			fill='#111110'
			fillOpacity={0.5}
			xmlns='http://www.w3.org/2000/svg'
			role='img'
			aria-label='A grid of geometric shapes'
			className={className}
		>
			<Background />

			<GroupA />
			<GroupB />
			<GroupC />
			<GroupD />
			<GroupE />
			<GroupF />
			<GroupG />
		</svg>
	);
}

function Background() {
	return <rect width='1280' height='964' fill='#1C1816' rx={16} />;
}

function GroupA() {
	const [scopeA2, animate] = useAnimate<SVGCircleElement>();
	const [scopeA3] = useAnimate<SVGCircleElement>();

	const a2 = {
		cy: 95,
	};
	const a3 = {
		cy: 95,
	};

	const animationSequence = useCallback(async () => {
		await animate(
			[
				[scopeA2.current, { cy: a2.cy, opacity: 1 }, { delay: 1, ease: 'easeInOut', duration: 1.5 }],
				[scopeA3.current, { cy: a3.cy, opacity: 1 }, { delay: 2, ease: 'easeInOut', duration: 1.5 }],
			],
			{ repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse', repeatDelay: 5 },
		);
	}, [scopeA2, scopeA3, animate]);

	useEffect(() => {
		animationSequence();
	}, [animationSequence]);

	return (
		<>
			<rect x='16' y='16' width='616' height='300' rx='16' fill='#28211D' />
			<circle cx='95' cy='95' r='63' fill='#6F6D66' />
			<motion.circle ref={scopeA2} cx='237' cy={a2.cy} r='63' fill='#6F6D66' initial={{ cy: 0, opacity: 0 }} />
			<motion.circle ref={scopeA3} cx='379' cy={a3.cy} r='63' fill='#6F6D66' initial={{ cy: 0, opacity: 0 }} />
		</>
	);
}

function GroupB() {
	return (
		<>
			<rect x='648' y='16' width='300' height='300' rx='16' fill='#28211D' />
			<motion.circle
				cx='726.66'
				cy='95'
				r='63'
				fill='#6F6D66'
				animate={{ cy: 0, opacity: 0 }}
				initial={{ cy: 95, opacity: 1 }}
				transition={{
					delay: 6.5,
					ease: 'easeInOut',
					duration: 1.5,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: 'reverse',
					repeatDelay: 7,
				}}
			/>
		</>
	);
}

function GroupC() {
	return <rect x='964' y='16' width='300' height='300' rx='16' fill='#28211D' />;
}

function GroupD() {
	return <rect x='332' y='332' width='300' height='300' rx='16' fill='#28211D' />;
}

function GroupE() {
	const [scopeE1, animate] = useAnimate<SVGCircleElement>();
	const [scopeE2] = useAnimate<SVGCircleElement>();

	const e1 = {
		cx: 1043,
	};
	const e2 = {
		cx: 1185,
	};

	const exitX = e2.cx + 100;

	const animationSequence = useCallback(async () => {
		await animate(
			[
				[scopeE1.current, { cx: e1.cx, opacity: 1 }],
				[scopeE2.current, { cx: e2.cx, opacity: 1 }, { ease: 'easeInOut', duration: 1.5 }],
				[scopeE2.current, { cx: exitX, opacity: 0 }, { delay: 2.5, ease: 'easeInOut', duration: 1.5 }],
				[scopeE1.current, { cx: exitX, opacity: 0 }, { delay: 1, ease: 'easeInOut', duration: 1.5 }],
			],
			{ repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse', repeatDelay: 4 },
		);
	}, [scopeE1, scopeE2, animate, exitX]);

	useEffect(() => {
		animationSequence();
	}, [animationSequence]);

	return (
		<>
			<rect x='964' y='332' width='300' height='616' rx='16' fill='#28211D' />
			<motion.circle ref={scopeE1} cx={e1.cx} cy='411.33' r='63' fill='#6F6D66' initial={{ cx: e1.cx, opacity: 1 }} />
			<motion.circle
				ref={scopeE2}
				cx={e2.cx}
				cy='411.33'
				r='63'
				fill='#6F6D66'
				initial={{ cx: e2.cx + 100, opacity: 0 }}
			/>
		</>
	);
}

function GroupF() {
	const [scopeF2, animate] = useAnimate<SVGCircleElement>();
	const [scopeF3] = useAnimate<SVGCircleElement>();
	const [scopeF4] = useAnimate<SVGCircleElement>();

	const f2 = {
		cy: 726.66,
	};
	const f3 = {
		cy: 869,
	};
	const f4 = {
		cy: 869,
	};

	const exitY = f4.cy + 100;

	const animationSequence = useCallback(async () => {
		await animate(
			[
				// Bring F4 in
				[scopeF4.current, { cy: f4.cy, opacity: 1 }, { delay: 1.5, ease: 'easeInOut', duration: 1.5 }],
				// Bring F4 out
				[scopeF4.current, { cy: exitY, opacity: 0 }, { delay: 2.5, ease: 'easeInOut', duration: 1.5 }],
				// Bring F3 out
				[scopeF3.current, { cy: exitY, opacity: 0 }, { delay: -0.75, ease: 'easeInOut', duration: 1.5 }],
				// Bring F2 out
				[scopeF2.current, { cy: exitY, opacity: 0 }, { delay: 3.5, ease: 'easeInOut', duration: 1.5 }],
			],
			{ repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse', repeatDelay: 6 },
		);
	}, [scopeF2, scopeF3, scopeF4, animate, exitY]);

	useEffect(() => {
		animationSequence();
	}, [animationSequence]);

	return (
		<>
			<rect x='16' y='648' width='300' height='300' rx='16' fill='#28211D' />
			<circle cx='95' cy='726.66' r='63' fill='#6F6D66' />
			<motion.circle ref={scopeF2} cx='237' cy={f2.cy} r='63' fill='#6F6D66' initial={{ cy: f2.cy, opacity: 1 }} />
			<motion.circle ref={scopeF3} cx='95' cy={f3.cy} r='63' fill='#6F6D66' initial={{ cy: f3.cy, opacity: 1 }} />
			<motion.circle ref={scopeF4} cx='237' cy={f4.cy} r='63' fill='#6F6D66' initial={{ cy: exitY, opacity: 0 }} />
		</>
	);
}

function GroupG() {
	const [scopeG1, animate] = useAnimate<SVGCircleElement>();
	const [scopeG2] = useAnimate<SVGCircleElement>();
	const [scopeG3] = useAnimate<SVGCircleElement>();
	const [scopeG4] = useAnimate<SVGCircleElement>();

	const g1 = {
		cy: 726.66,
	};
	const g2 = {
		cy: 726.66,
	};
	const g3 = {
		cy: 868.66,
	};
	const g4 = {
		cy: 868.66,
	};

	const exitY = g3.cy + 100;

	const animationSequence = useCallback(async () => {
		await animate(
			[
				// Bring G3 out
				[scopeG3.current, { cy: exitY, opacity: 0 }, { delay: 0, ease: 'easeInOut', duration: 1.5 }],
				// Bring G3 in
				[scopeG3.current, { cy: g3.cy, opacity: 1 }, { delay: 5.5, ease: 'easeInOut', duration: 1.5 }],
				// Bring G4 in
				[scopeG4.current, { cy: g4.cy, opacity: 1 }, { delay: 2.5, ease: 'easeInOut', duration: 1.5 }],
				// Bring G4 out
				[scopeG4.current, { cy: exitY, opacity: 0 }, { delay: 4, ease: 'easeInOut', duration: 1.5 }],
				// Bring G3 out
				[scopeG3.current, { cy: exitY, opacity: 0 }, { delay: -1, ease: 'easeInOut', duration: 1.5 }],
				// Bring G2 out
				[scopeG2.current, { cy: exitY, opacity: 0 }, { delay: 1.25, ease: 'easeInOut', duration: 1.5 }],
				// Bring G2 in
				[scopeG2.current, { cy: g2.cy, opacity: 1 }, { delay: 4.5, ease: 'easeInOut', duration: 1.5 }],
				// Bring G2 out
				[scopeG2.current, { cy: exitY, opacity: 0 }, { delay: 3, ease: 'easeInOut', duration: 1.5 }],
				// Bring G1 out
				[scopeG1.current, { cy: exitY, opacity: 0 }, { delay: 0.25, ease: 'easeInOut', duration: 1.5 }],
			],
			{ repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse', repeatDelay: 3 },
		);
	}, [scopeG1, scopeG2, scopeG3, scopeG4, animate, exitY]);

	useEffect(() => {
		animationSequence();
	}, [animationSequence]);

	return (
		<>
			<rect x='648' y='648' width='300' height='300' rx='16' fill='#28211D' />
			<motion.circle ref={scopeG1} cx='726.66' cy={g1.cy} r='63' fill='#6F6D66' initial={{ cy: g1.cy, opacity: 1 }} />
			<motion.circle ref={scopeG2} cx='869' cy={g2.cy} r='63' fill='#6F6D66' initial={{ cy: g2.cy, opacity: 1 }} />
			<motion.circle ref={scopeG3} cx='726.66' cy={g3.cy} r='63' fill='#6F6D66' initial={{ cy: g3.cy, opacity: 1 }} />
			<motion.circle ref={scopeG4} cx='869' cy={g4.cy} r='63' fill='#6F6D66' initial={{ cy: exitY, opacity: 0 }} />
		</>
	);
}
