<script module lang="ts"> 
	import { gsap } from 'gsap'; 
	import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
 
	gsap.registerPlugin(ScrollTrigger); 
</script> 
 
<script lang="ts"> 
	type Props = { 
		text: string; 
		scrollContainer?: HTMLElement | null; 
		enableBlur?: boolean; 
		baseOpacity?: number; 
		baseRotation?: number; 
		blurStrength?: number; 
		containerClassName?: string; 
		textClassName?: string; 
		rotationEnd?: string; 
		wordAnimationEnd?: string; 
	}; 
 
	let { 
		text, 
		scrollContainer = null, 
		enableBlur = true, 
		baseOpacity = 0.1, 
		baseRotation = 3, 
		blurStrength = 4, 
		containerClassName = '', 
		textClassName = '', 
		rotationEnd = 'bottom bottom', 
		wordAnimationEnd = 'bottom bottom' 
	}: Props = $props(); 
 
	let containerEl = $state<HTMLHeadingElement | undefined>(); 
 
	const splitParts = $derived(text.split(/(\s+)/)); 
 
	$effect(() => { 
		const el = containerEl; 
		if (!el) return; 
 
		void enableBlur; 
		void baseOpacity; 
		void baseRotation; 
		void blurStrength; 
		void rotationEnd; 
		void wordAnimationEnd; 
		void scrollContainer; 
		void splitParts; 
 
		const scroller =
			scrollContainer ??
			(typeof document !== 'undefined'
				? (document.querySelector('.skills-scrollbar') as HTMLElement)
				: null) ??
			window; 

		const wordElements = el.querySelectorAll('.scroll-reveal-word'); 

		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			gsap.set(el, { rotate: 0 });
			gsap.set(wordElements, { opacity: 1, filter: 'blur(0px)' });
			return;
		}

		const triggers: ScrollTrigger[] = []; 
 
		if (baseRotation !== 0) {
			const rotationTween = gsap.fromTo( 
				el, 
				{ transformOrigin: '0% 50%', rotate: baseRotation }, 
				{ 
					ease: 'none', 
					rotate: 0, 
					scrollTrigger: { 
						trigger: el, 
						scroller, 
						start: 'top bottom', 
						end: rotationEnd, 
						scrub: true 
					} 
				} 
			); 
			if (rotationTween.scrollTrigger) triggers.push(rotationTween.scrollTrigger); 
		}
 
		const opacityTween = gsap.fromTo( 
			wordElements, 
			{ opacity: baseOpacity, willChange: 'opacity' }, 
			{ 
				ease: 'none', 
				opacity: 1, 
				stagger: 0.05, 
				scrollTrigger: { 
					trigger: el, 
					scroller, 
					start: 'top bottom-=20%', 
					end: wordAnimationEnd, 
					scrub: true 
				} 
			} 
		); 
		if (opacityTween.scrollTrigger) triggers.push(opacityTween.scrollTrigger); 
 
		if (enableBlur) { 
			const blurTween = gsap.fromTo( 
				wordElements, 
				{ filter: `blur(${blurStrength}px)`, willChange: 'filter' }, 
				{ 
					ease: 'none', 
					filter: 'blur(0px)', 
					stagger: 0.05, 
					scrollTrigger: { 
						trigger: el, 
						scroller, 
						start: 'top bottom-=20%', 
						end: wordAnimationEnd, 
						scrub: true 
					} 
				} 
			); 
			if (blurTween.scrollTrigger) triggers.push(blurTween.scrollTrigger); 
		} 
 
		return () => { 
			triggers.forEach((t) => t.kill()); 
		}; 
	}); 
</script> 
 
<h2 bind:this={containerEl} class="scroll-reveal {containerClassName}"> 
	<p class="scroll-reveal-text {textClassName}"> 
		{#each splitParts as part, i (i)} 
			{#if /^\s+$/.test(part)}{part}{:else}<span class="scroll-reveal-word">{part}</span>{/if} 
		{/each} 
	</p> 
</h2> 
 
<style> 
	.scroll-reveal { 
		margin: 0; 
	} 
 
	.scroll-reveal-text { 
		line-height: 1.6; 
	} 
 
	.scroll-reveal-word { 
		display: inline-block; 
		will-change: opacity, filter;
	} 
</style> 
