<script lang="ts">
    import { enhance } from "$app/forms";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    export let form;
</script>

<svelte:head>
    <title>Site Settings — Admin | CipherSaga</title>
</svelte:head>

<div
    class="relative min-h-screen w-full flex-col items-center justify-start antialiased p-8 z-0"
>
    <div class="fixed inset-0 z-[-1]">
        <BackgroundBeams />
    </div>

    <div class="max-w-2xl mx-auto relative z-10">
        <!-- Header -->
        <div class="mb-8">
            <a
                href="/admin"
                class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
                >← Dashboard</a
            >
            <h1
                class="text-3xl font-bold mt-1 bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-transparent pb-1"
            >
                ⚙️ Site Settings
            </h1>
            <p class="text-neutral-500 text-sm mt-1">
                Control game timing and maintenance mode
            </p>
        </div>

        <!-- Alerts -->
        {#if form?.success}
            <div
                class="alert bg-emerald-950/50 border border-emerald-900 text-emerald-200 mb-6 shadow-lg backdrop-blur-md"
            >
                <span>✅ Settings saved successfully!</span>
            </div>
        {/if}
        {#if form?.error}
            <div
                class="alert bg-red-950/50 border border-red-900 text-red-200 mb-6 shadow-lg backdrop-blur-md"
            >
                <span>{form.error}</span>
            </div>
        {/if}

        <form
            method="POST"
            action="?/save"
            use:enhance
            class="flex flex-col gap-6"
        >
            <!-- Game Time Window -->
            <div
                class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-sm"
            >
                <div class="card-body">
                    <h2 class="card-title text-neutral-200 text-lg mb-1">
                        🕐 Game Time Window
                    </h2>
                    <p class="text-neutral-500 text-sm mb-4">
                        Players can only access questions between these times.
                    </p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Game Start Time</span
                                ></label
                            >
                            <input
                                name="gameStartTime"
                                type="datetime-local"
                                value={data.settings.gameStartTime}
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Game End Time</span
                                ></label
                            >
                            <input
                                name="gameEndTime"
                                type="datetime-local"
                                value={data.settings.gameEndTime}
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>
                    <p class="text-xs text-neutral-600 mt-2">
                        Note: Times are in your local timezone. Admins always
                        see all questions regardless of this setting.
                    </p>
                </div>
            </div>

            <!-- Maintenance Mode -->
            <div
                class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-sm"
            >
                <div class="card-body">
                    <h2 class="card-title text-neutral-200 text-lg mb-1">
                        🔧 Maintenance Mode
                    </h2>
                    <p class="text-neutral-500 text-sm mb-4">
                        When enabled, the play page will show a maintenance
                        message to all non-admin players.
                    </p>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-3">
                            <input
                                name="maintenanceMode"
                                type="checkbox"
                                class="toggle toggle-warning"
                                checked={data.settings.maintenanceMode}
                            />
                            <span class="label-text text-neutral-300"
                                >Enable Maintenance Mode</span
                            >
                        </label>
                    </div>
                    <div class="form-control mt-3">
                        <label class="label"
                            ><span class="label-text text-neutral-400"
                                >Maintenance Message</span
                            ></label
                        >
                        <textarea
                            name="maintenanceMessage"
                            class="textarea textarea-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary h-20"
                            >{data.settings.maintenanceMessage}</textarea
                        >
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button
                    type="submit"
                    class="btn btn-primary bg-primary text-black hover:bg-primary/80 border-none px-8"
                >
                    Save Settings
                </button>
            </div>
        </form>
    </div>
</div>
