<script>
	/** @type {{ urlImg?: string, onclose?: () => void }} */
	let { urlImg, onclose } = $props();

	/** @type {HTMLDialogElement} */
	let dialog;

	// native modal: top layer, focus trap, inert background, Esc closes
	$effect(() => {
		dialog.showModal();
	});
</script>

<!-- Esc is handled natively (fires `close`); any click also closes -->
<dialog bind:this={dialog} onclose={() => onclose?.()} onclick={() => dialog.close()}>
	<img src={urlImg} alt="" />
</dialog>

<style>
	dialog {
		/* fill the viewport so any click lands on the dialog, like the old overlay */
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
	}
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.61);
	}
	img {
		box-shadow: rgba(250, 250, 250, 0.66) 0 30px 60px 0;
		max-height: 90%;
		max-width: 90%;
		object-fit: contain;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
