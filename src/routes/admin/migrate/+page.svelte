<script lang="ts">
    import { sendErrorToast, sendSuccessToast } from "$lib/toast_utils";

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
    class="min-h-screen pt-24 px-4 bg-zinc-950 text-white font-mono flex flex-col items-center"
>
    <div
        class="max-w-xl w-full bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl"
    >
        <h1 class="text-3xl font-bold mb-4 text-warning">
            ⚠ Schema Migration
        </h1>
        <p class="text-zinc-400 mb-8">
            This tool will scan all existing teams in the <code>teams</code>
            collection and create a corresponding reservation in the
            <code>teamNames</code>
            collection.
            <br /><br />
            Run this ONCE to ensure old team names cannot be claimed by new users.
        </p>

        <div class="flex flex-col gap-4">
            <button
                class="btn btn-warning btn-lg w-full"
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
                <div class="mockup-code bg-black text-xs mt-4">
                    <pre data-prefix="$"><code>{result}</code></pre>
                </div>
            {/if}
        </div>
    </div>
</div>
