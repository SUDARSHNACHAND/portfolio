<script lang="ts">
	type VelocityMapping = { input: [number, number]; output: [number, number] };

	type Props = {
		scrollContainer?: HTMLElement | null;
		texts?: string[];
		velocity?: number;
		class?: string;
		damping?: number;
		stiffness?: number;
		numCopies?: number;
		velocityMapping?: VelocityMapping;
		parallaxClass?: string;
		scrollerClass?: string;
		parallaxStyle?: string;
		scrollerStyle?: string;
	};

	let {
		scrollContainer = null,
		texts = [],
		velocity = 100,
		class: className = '',
		damping = 50,
		stiffness = 400,
		numCopies = 6,
		velocityMapping = { input: [0, 1000], output: [0, 5] },
		parallaxClass = 'parallax',
		scrollerClass = 'scroller',
		parallaxStyle = '',
		scrollerStyle = ''
	}: Props = $props();

	let copyEls = $state<(HTMLSpanElement | undefined)[]>([]);
	let scrollerEls = $state<(HTMLDivElement | undefined)[]>([]);

	function wrap(min: number, max: number, v: number): number {
		const range = max - min;
		const mod = (((v - min) % range) + range) % range;
		return mod + min;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		const getTarget = (): HTMLElement | Window => {
			if (scrollContainer) return scrollContainer;
			if (typeof document !== 'undefined') {
				const el = document.querySelector('.skills-scrollbar') as HTMLElement;
				if (el) return el;
			}
			return window;
		};

		const getScrollY = () => {
			const target = getTarget();
			return target === window
				? window.scrollY || window.pageYOffset || 0
				: (target as HTMLElement).scrollTop;
		};

		const count = texts.length;
		const baseX = new Array(count).fill(0);
		const directionFactors = new Array(count).fill(1);

		let prevScrollY = getScrollY();
		let smoothVelocity = 0;
		let springVel = 0;
		let lastTime = performance.now();

		const [iMin, iMax] = velocityMapping?.input ?? [0, 1000];
		const [oMin, oMax] = velocityMapping?.output ?? [0, 5];
		const inputSpan = iMax - iMin || 1;

		let raf = 0;
		const tick = (t: number) => {
			const dtRaw = (t - lastTime) / 1000;
			const dt = Math.min(dtRaw, 0.05);
			lastTime = t;

			const sy = getScrollY();
			const scrollVelocity = dtRaw > 0 ? (sy - prevScrollY) / dtRaw : 0;
			prevScrollY = sy;

			const accel = stiffness * (scrollVelocity - smoothVelocity) - damping * springVel;
			springVel += accel * dt;
			smoothVelocity += springVel * dt;

			const velocityFactor = ((smoothVelocity - iMin) / inputSpan) * (oMax - oMin) + oMin;

			for (let i = 0; i < count; i++) {
				const baseVelocity = i % 2 !== 0 ? -velocity : velocity;
				let moveBy = directionFactors[i] * baseVelocity * dt;

				if (velocityFactor < 0) directionFactors[i] = -1;
				else if (velocityFactor > 0) directionFactors[i] = 1;

				moveBy += directionFactors[i] * moveBy * velocityFactor;
				baseX[i] += moveBy;

				const copy = copyEls[i];
				const scroller = scrollerEls[i];
				if (!copy || !scroller) continue;

				const copyWidth = copy.offsetWidth;
				if (copyWidth > 0) {
					const x = wrap(-copyWidth, 0, baseX[i]);
					scroller.style.transform = `translate3d(${x}px, 0, 0)`;
				}
			}

			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});
</script>

<section class="relative w-full overflow-hidden select-none py-2 md:py-4">
	<!-- Ambient decorative glowing lines -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff8c00]/30 to-transparent z-10"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff8c00]/30 to-transparent z-10"
		aria-hidden="true"
	></div>

	<!-- Edge gradient fade masks for smooth flow -->
	<div
		class="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 md:w-36 bg-gradient-to-r from-[#1a130d] via-[#1a130d]/80 to-transparent z-10"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 md:w-36 bg-gradient-to-l from-[#1a130d] via-[#1a130d]/80 to-transparent z-10"
		aria-hidden="true"
	></div>

	{#each texts as text, i (i)}
		<div class="{parallaxClass} py-1 sm:py-2" style={parallaxStyle}>
			<div bind:this={scrollerEls[i]} class={scrollerClass} style={scrollerStyle}>
				{#each Array.from({ length: Math.max(numCopies, 1) }, (_, j) => j) as j (j)}
					{#if j === 0}
						<span bind:this={copyEls[i]} class={className}>
							{#if text.includes('→')}
								{#each text.split('→').filter((part) => part.trim().length > 0) as part}
									<span
										class="stage-word font-black uppercase tracking-wider transition-all duration-200
											{i % 2 === 0
												? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#ffdb58] drop-shadow-[0_2px_12px_rgba(255,219,88,0.15)]'
												: 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] via-[#ffdb58] to-white drop-shadow-[0_2px_12px_rgba(255,140,0,0.15)]'}"
									>
										{part.trim()}
									</span>
									<span
										class="stage-arrow px-2.5 sm:px-3.5 md:px-5 font-bold select-none
											{i % 2 === 0 ? 'text-[#ff8c00]' : 'text-[#ffdb58]'}
											drop-shadow-[0_0_12px_rgba(255,140,0,0.65)]"
										aria-hidden="true"
									>
										&rarr;
									</span>
								{/each}
							{:else}
								{text}&nbsp;
							{/if}
						</span>
					{:else}
						<span class={className}>
							{#if text.includes('→')}
								{#each text.split('→').filter((part) => part.trim().length > 0) as part}
									<span
										class="stage-word font-black uppercase tracking-wider transition-all duration-200
											{i % 2 === 0
												? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#ffdb58] drop-shadow-[0_2px_12px_rgba(255,219,88,0.15)]'
												: 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c00] via-[#ffdb58] to-white drop-shadow-[0_2px_12px_rgba(255,140,0,0.15)]'}"
									>
										{part.trim()}
									</span>
									<span
										class="stage-arrow px-2.5 sm:px-3.5 md:px-5 font-bold select-none
											{i % 2 === 0 ? 'text-[#ff8c00]' : 'text-[#ffdb58]'}
											drop-shadow-[0_0_12px_rgba(255,140,0,0.65)]"
										aria-hidden="true"
									>
										&rarr;
									</span>
								{/each}
							{:else}
								{text}&nbsp;
							{/if}
						</span>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</section>

<style>
	section :global(.parallax) {
		position: relative;
		overflow: hidden;
	}
	section :global(.scroller) {
		display: flex;
		white-space: nowrap;
		text-align: center;
		font-family: sans-serif;
		font-size: 1.75rem;
		line-height: 2.25rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		will-change: transform;
	}
	section :global(.scroller span) {
		flex-shrink: 0;
	}
	@media (min-width: 640px) {
		section :global(.scroller) {
			font-size: 2.5rem;
			line-height: 3rem;
		}
	}
	@media (min-width: 768px) {
		section :global(.scroller) {
			font-size: 3.5rem;
			line-height: 4rem;
		}
	}
	@media (min-width: 1024px) {
		section :global(.scroller) {
			font-size: 4.5rem;
			line-height: 5rem;
		}
	}
</style>
