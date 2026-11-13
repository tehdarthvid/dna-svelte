<script>
	/**
	 * @type {{ params: {
	 *   title?: string, date?: string, url?: string,
	 *   ytVideoID?: string, vidURL?: string, imgURL?: string
	 * },
	 *   onopen?: (params: object) => void
	 * }}
	 */
	let { params, onopen } = $props();

	let mX = $state(0);
	let mY = $state(0);
	const rX = $derived(mX * 30);
	const rY = $derived(mY * -30);
	const tX = $derived(mX * -40);
	const tY = $derived(mY * -40);

	let isBgImageLoaded = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let mouseLeaveDelay;

	/*
	 * Svelte lifecycle handlers
	 */

	$effect(() => {
		if (!params.vidURL && !isBgImageLoaded && params.imgURL) {
			const img = new Image();
			img.onload = handleImageLoaded;
			img.src = params.imgURL;
		}
	});
	$effect(() => () => clearTimeout(mouseLeaveDelay));

	/*
	 * event handlers
	 */

	const handleImageLoaded = () => {
		// console.log(params.title);
		isBgImageLoaded = true;
	};
	/** @param {MouseEvent & { currentTarget: HTMLElement }} e */
	function handleMouseMove(e) {
		const el = e.currentTarget;
		mX = (e.pageX - el.offsetLeft - el.clientWidth / 2) / el.clientWidth;
		mY = (e.pageY - el.offsetTop - el.clientHeight / 2) / el.clientHeight;
	}
	function handleMouseEnter() {
		clearTimeout(mouseLeaveDelay);
	}
	function handleMouseLeave() {
		mouseLeaveDelay = setTimeout(() => {
			mX = mY = 0;
		}, 1000);
	}
	function handleDblClick() {
		onopen?.(params);
	}
</script>

<div
	role="img"
	aria-label={params.title ? params.title : ''}
	class="card-wrap"
	onmousemove={handleMouseMove}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	ondblclick={handleDblClick}
>
	<div class="card" style="transform: rotateY({rX}deg) rotateX({rY}deg)">
		{#if null != params.ytVideoID}
			<div
				class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg'}
				style="transform: translateX({tX}px) translateY({tY}px); "
			>
				<iframe
					title={params.title ? params.title : ''}
					class="center_video"
					width="560"
					height="315"
					loading="lazy"
					onload={handleImageLoaded}
					src="https://www.youtube.com/embed/{params.ytVideoID}?rel=0&controls=0&autoplay=1&mute=1&loop=1&playlist={params.ytVideoID}"
					frameborder="0"
					allow="accelerometer; autoplay; encrypted-media; gyroscope;
          picture-in-picture"
					allowfullscreen
				>
				</iframe>
			</div>
		{:else if null != params.vidURL}
			<div
				class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg'}
				style="transform: translateX({tX}px) translateY({tY}px); "
			>
				<video
					class="center_video"
					src={params.vidURL}
					autoplay
					loop
					muted
					onplaying={handleImageLoaded}
				>
				</video>
			</div>
		{:else if null != params.imgURL}
			<div
				class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg'}
				style="transform: translateX({tX}px) translateY({tY}px);
        background-image: url({params.imgURL})"
			></div>
		{/if}

		<div class="card-info">
			<h1>{params.title ? params.title : ''}</h1>
			<p>{params.date ? params.date : ''}</p>
		</div>
	</div>
</div>

<style>
	p {
		font-size: 0.618em;
	}
	h1 + p {
		margin-top: 10px;
	}
	* {
		-webkit-margin-before: 0px;
		-webkit-margin-after: 0px;
	}
	.card-wrap {
		width: 240px;
		height: 320px;
		margin: 10px;
		transform: perspective(800px);
		transform-style: preserve-3d;
		cursor: pointer;
	}
	.card-wrap:hover .card-info {
		transform: translateY(0);
	}
	.card-wrap:hover .card-info p,
	.card-wrap:hover .card-info h1 {
		opacity: 1;
	}
	.card-wrap:hover .card-info,
	.card-wrap:hover .card-info h1,
	.card-wrap:hover .card-info p {
		transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}
	.card-wrap:hover .card-info:after {
		transition: 5s cubic-bezier(0.23, 1, 0.32, 1);
		opacity: 1;
		transform: translateY(0);
	}
	.card-wrap:hover .card-bg {
		transition:
			0.6s cubic-bezier(0.23, 1, 0.32, 1),
			opacity 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
		opacity: 0.9;
	}
	.card-wrap:hover .card {
		transition:
			0.6s cubic-bezier(0.23, 1, 0.32, 1),
			box-shadow 2s cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow:
			rgba(255, 255, 255, 0.2) 0 0 40px 5px,
			rgba(255, 255, 255, 1) 0 0 0 1px,
			rgba(0, 0, 0, 0.66) 0 30px 60px 0,
			inset #333 0 0 0 5px,
			inset white 0 0 0 6px;
	}
	.card {
		position: relative;
		text-align: center;
		flex: 0 0 240px;
		width: 100%;
		height: 100%;
		background-color: #333;
		overflow: hidden;
		border-radius: 5px;
		box-shadow:
			rgba(0, 0, 0, 0.66) 0 30px 60px 0,
			inset #333 0 0 0 5px,
			inset rgba(255, 255, 255, 0.5) 0 0 0 6px;
		transition: 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
	}
	.card-bg {
		opacity: 0;
		position: absolute;
		top: -20px;
		left: -20px;
		width: 100%;
		height: 100%;
		padding: 20px;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		transition:
			1s cubic-bezier(0.445, 0.05, 0.55, 0.95),
			opacity 2s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
		pointer-events: none;
	}
	.card-bg__fade-in {
		opacity: 0.4;
	}
	.card-info {
		word-break: keep-all;
		padding-top: 20px;
		padding-bottom: 20px;
		position: absolute;
		bottom: 0;
		color: #fff;
		transform: translateY(40px);
		transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
		width: 100%;
	}
	.card-info h1 {
		font-size: 1em;
		font-weight: 700;
		text-shadow: rgba(0, 0, 0, 0.5) 0 10px 10px;
		opacity: 0.4;
		transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
	}
	.card-info p {
		opacity: 0;
		text-shadow: rgba(0, 0, 0, 1) 0 2px 3px;
		transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
	}
	.card-info * {
		position: relative;
		z-index: 1;
	}
	.card-info:after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
		background-blend-mode: overlay;
		opacity: 0;
		transform: translateY(100%);
		transition: 5s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
	}

	/* 
   * Center the video inside the card like the image verison. 
   * Otherwise, everything else rely on `card-bg`.
   */
	.center_video {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
