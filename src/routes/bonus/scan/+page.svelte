<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import QRScanner from "$lib/components/QRScanner.svelte";
    import {
        sendErrorToast,
        sendSuccessToast,
        sendInfoToast,
    } from "$lib/toast_utils";

    let scanning = false;
    let processing = false;

    // Check for "code" query param on mount
    onMount(async () => {
        const code = $page.url.searchParams.get("code");
        if (code) {
            await handleScan(code);
        }
    });

    async function handleScan(code: string) {
        if (processing) return;
        processing = true;

        // Show loading toast if it's a URL visit (might take a moment)
        if ($page.url.searchParams.get("code")) {
            sendInfoToast("Processing...", "Validating QR Code");
        }

        try {
            const res = await fetch("/api/bonus/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrString: code }),
            });

            const data = await res.json();

            if (res.ok) {
                sendSuccessToast(
                    "Bonus Found!",
                    data.message || "Points and hint unlocked.",
                );
                // Redirect to bonus dashboard where the new active bonus should be visible
                goto("/bonus?new=" + code);
            } else {
                sendErrorToast(
                    "Scan Failed",
                    data.message || "Invalid or expired QR code.",
                );
                // If it failed from URL, maybe stay here and show scanner?
                // If it failed from scanner, just show error.
            }
        } catch (err) {
            console.error(err);
            sendErrorToast("Error", "Network error while processing scan.");
        } finally {
            processing = false;
        }
    }

    function onCameraScan(event: CustomEvent) {
        handleScan(event.detail.code);
    }
</script>

<div
    class="min-h-screen pt-24 px-4 pb-12 bg-zinc-950 text-white font-mono flex flex-col items-center"
>
    <div
        class="max-w-md w-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-xl p-6 shadow-2xl"
    >
        <h1
            class="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        >
            QR Scanner
        </h1>

        <p class="text-center text-zinc-400 mb-8">
            Scan a hidden QR code to unlock a bonus question and its hint.
        </p>

        {#if processing}
            <div class="flex flex-col items-center py-12">
                <span class="loading loading-spinner loading-lg text-accent"
                ></span>
                <p class="mt-4 text-accent animate-pulse">
                    Decrypting Signal...
                </p>
            </div>
        {:else}
            <QRScanner on:scan={onCameraScan} />

            <div class="divider my-8 text-zinc-600">OR</div>

            <button
                class="btn btn-outline btn-block text-zinc-400 hover:text-white"
                on:click={() => goto("/bonus")}
            >
                Return to Dashboard
            </button>
        {/if}
    </div>
</div>
