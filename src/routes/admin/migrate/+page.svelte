<script lang="ts">
    import { sendErrorToast, sendSuccessToast } from "$lib/toast_utils";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

    let migrating = false;
    let result = "";

    async function runMigration() {
        if (
            !confirm(
                "Are you sure? This will backfill the 'teamNames' collection based on existing teams.",
            )
        )
            return;

        migrating = true;
        result = "Migrating...";

        try {
            const res = await fetch("/api/admin/migrate", {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok) {
                result = data.message;
                sendSuccessToast("Migration Complete", data.message);
            } else {
                result = "Error: " + data.message;
                sendErrorToast("Migration Failed", data.message);
            }
        } catch (err: any) {
            result = "Error: " + err.message;
            sendErrorToast("Error", "Network error");
        } finally {
            migrating = false;
        }
    }
</script>

<div
    class="relative min-h-screen w-full flex flex-col items-center pt-24 px-4 font-mono z-0 overflow-y-auto"
>
    <div class="fixed inset-0 z-[-1]">
        <BackgroundBeams />
    </div>

    <div
        class="max-w-xl w-full bg-zinc-950/80 border border-zinc-800 p-8 rounded-xl shadow-2xl backdrop-blur-sm relative z-10"
    >
        <h1
            class="text-3xl font-bold mb-4 bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-transparent pb-1"
        >
            ⚠ Schema Migration
        </h1>
        <p class="text-neutral-400 mb-8">
            This tool will scan all existing teams in the <code
                class="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-neutral-300"
                >teams</code
            >
            collection and create a corresponding reservation in the
            <code
                class="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-neutral-300"
                >teamNames</code
            >
            collection.
            <br /><br />
            Run this ONCE to ensure old team names cannot be claimed by new users.
        </p>

        <div class="flex flex-col gap-4">
            <button
                class="btn btn-warning btn-lg w-full bg-orange-500/10 text-orange-400 border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500/70 transition-colors"
                disabled={migrating}
                on:click={runMigration}
            >
                {#if migrating}
                    <span class="loading loading-spinner"></span> Processing...
                {:else}
                    Start Migration
                {/if}
            </button>

            {#if result}
                <div
                    class="mockup-code bg-black/60 border border-zinc-800 text-xs mt-4 backdrop-blur-md text-neutral-300"
                >
                    <pre data-prefix="$"><code>{result}</code></pre>
                </div>
            {/if}
        </div>
    </div>
</div>
