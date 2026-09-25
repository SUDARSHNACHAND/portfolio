<script lang="ts">
	import type { Snippet } from 'svelte';

	type Easing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
	type Spark = { x: number; y: number; angle: number; startTime: number };

	type Props = {
		children?: Snippet;
		sparkColor?: string;
		sparkSize?: number;
		sparkRadius?: number;
		sparkCount?: number;
		duration?: number;
		easing?: Easing;
		extraScale?: number;
		class?: string;
	};

	let {
		children,
		sparkColor = '#fff',
		sparkSize = 10,
		sparkRadius = 15,
		sparkCount = 8,
		duration = 400,
		easing = 'ease-out',
		extraScale = 1.0,
		class: className = ''
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;
	const sparks: Spark[] = [];

	function easeFunc(t: number): number {
		switch (easing) {
			case 'linear':
				return t;
			case 'ease-in':
				return t * t;
			case 'ease-in-out':
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			default:
				return t * (2 - t);
		}
	}

	$effect(() => {
		if (!canvas || !wrapper) return;

		let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
		const resizeCanvas = () => {
			const { width, height } = wrapper.getBoundingClientRect();
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
		};
		const ro = new ResizeObserver(() => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeCanvas, 100);
		});
		ro.observe(wrapper);
		resizeCanvas();

		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		let raf = 0;

		const startDraw = () => {
			if (raf !== 0) return;
			raf = requestAnimationFrame(draw);
		};

		const draw = (timestamp: number) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let i = sparks.length - 1; i >= 0; i--) {
				const spark = sparks[i];
				const elapsed = timestamp - spark.startTime;
				if (elapsed >= duration) {
					sparks.splice(i, 1);
					continue;
				}
				const progress = elapsed / duration;
				const eased = easeFunc(progress);
				const distance = eased * sparkRadius * extraScale;
				const lineLength = sparkSize * (1 - eased);
				const x1 = spark.x + distance * Math.cos(spark.angle);
				const y1 = spark.y + distance * Math.sin(spark.angle);
				const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
				const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
				ctx.strokeStyle = sparkColor;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}

			if (sparks.length > 0) {
				raf = requestAnimationFrame(draw);
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				raf = 0;
			}
		};

		return () => {
			ro.disconnect();
			clearTimeout(resizeTimeout);
			if (raf) cancelAnimationFrame(raf);
		};
	});

	function handleClick(e: MouseEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const now = performance.now();
		for (let i = 0; i < sparkCount; i++) {
			sparks.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now });
		}
		// Trigger active animation loop
		const ctx = canvas.getContext('2d');
		if (ctx && sparks.length > 0) {
			const draw = (timestamp: number) => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				for (let i = sparks.length - 1; i >= 0; i--) {
					const spark = sparks[i];
					const elapsed = timestamp - spark.startTime;
					if (elapsed >= duration) {
						sparks.splice(i, 1);
						continue;
					}
					const progress = elapsed / duration;
					const eased = easeFunc(progress);
					const distance = eased * sparkRadius * extraScale;
					const lineLength = sparkSize * (1 - eased);
					const x1 = spark.x + distance * Math.cos(spark.angle);
					const y1 = spark.y + distance * Math.sin(spark.angle);
					const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
					const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
					ctx.strokeStyle = sparkColor;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
				}
				if (sparks.length > 0) {
					requestAnimationFrame(draw);
				} else {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}
			};
			requestAnimationFrame(draw);
		}
	}
</script>

<div
	bind:this={wrapper}
	onclick={handleClick}
	role="presentation"
	class="relative w-full h-full {className}"
>
	{#if children}{@render children()}{/if}
	<canvas bind:this={canvas} class="absolute inset-0 pointer-events-none z-50"></canvas>
</div>
