<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { Html5Qrcode } from 'html5-qrcode';

    const dispatch = createEventDispatcher();
    let scannerId = "reader";
    let html5QrCode: Html5Qrcode;
    let scanning = false;
    let errorMsg = "";

    async function startScan() {
        try {
            scanning = true;
            errorMsg = "";
            // Small delay to ensure DOM is ready
             setTimeout(async () => {
                html5QrCode = new Html5Qrcode(scannerId);
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText, decodedResult) => {
                        console.log(`Code matched = ${decodedText}`, decodedResult);
                        dispatch('scan', { code: decodedText });
                        stopScan();
                    },
                    (errorMessage) => {
                        // ignore parse errors
                    }
                );
             }, 100);
        } catch (err) {
            console.error(err);
            scanning = false;
            errorMsg = "Failed to start camera. Please check permissions.";
        }
    }

    async function stopScan() {
        if (html5QrCode && scanning) {
            try {
                await html5QrCode.stop();
                html5QrCode.clear();
                scanning = false;
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    }

    onDestroy(() => {
        if(scanning) stopScan();
    });
</script>

<div class="flex flex-col items-center justify-center p-4 w-full">
    {#if !scanning}
        <button class="btn btn-primary btn-wide" on:click={startScan}>
            Scan QR Code
        </button>
    {:else}
         <button class="btn btn-error btn-wide mb-2" on:click={stopScan}>
            Stop Scanner
        </button>
    {/if}

    {#if errorMsg}
        <p class="text-error mt-2">{errorMsg}</p>
    {/if}
    
    <div id={scannerId} class="w-full max-w-md mt-4 rounded-lg overflow-hidden border-2 border-accent/50" style="display: {scanning ? 'block' : 'none'}"></div>
</div>
