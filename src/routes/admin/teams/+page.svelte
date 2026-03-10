<script lang="ts">
    import { enhance } from "$app/forms";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    export let form;

    let search = "";
    $: filtered = data.teams.filter((t: any) =>
        t.teamName.toLowerCase().includes(search.toLowerCase()),
    );

    let expandedTeams: Record<string, boolean> = {};
    function toggleExpanded(id: string) {
        expandedTeams[id] = !expandedTeams[id];
    }
</script>

<svelte:head>
    <title>Teams — Admin | CipherSaga</title>
</svelte:head>

<div
    class="relative min-h-screen w-full flex-col items-center justify-start antialiased p-8 z-0 overflow-y-auto"
>
    <div class="fixed inset-0 z-[-1]">
        <BackgroundBeams />
    </div>

    <!-- Header -->
    <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 relative z-10 max-w-6xl mx-auto gap-4"
    >
        <div>
            <a
                href="/admin"
                class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
                >← Dashboard</a
            >
            <h1
                class="text-3xl font-bold mt-1 bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-transparent pb-1"
            >
                Team Management
            </h1>
            <p class="text-neutral-500 mt-1 text-sm">
                {data.teams.length} teams total
            </p>
        </div>
        <input
            type="text"
            bind:value={search}
            placeholder="Search teams..."
            class="input input-bordered w-full sm:w-64 bg-zinc-950/80 border-zinc-700 text-neutral-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-md"
            id="team-search"
        />
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
        {#if form?.success}
            <div
                class="alert bg-emerald-950/50 border border-emerald-900 text-emerald-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span> Team updated successfully.</span>
            </div>
        {/if}
        {#if form?.error}
            <div
                class="alert bg-red-950/50 border border-red-900 text-red-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span>{form.error}</span>
            </div>
        {/if}

        <div class="grid gap-4">
            {#each filtered as team (team.id)}
                <div
                    class="card bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-sm overflow-hidden transition-all {team.banned
                        ? 'opacity-75 grayscale'
                        : ''}"
                >
                    <!-- Accordion Header: Only Team Name -->
                    <button
                        type="button"
                        class="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer text-left"
                        on:click={() => toggleExpanded(team.id)}
                    >
                        <h2 class="text-xl font-bold text-neutral-200">
                            {team.teamName}
                        </h2>

                        <div class="flex items-center gap-3">
                            {#if team.banned}
                                <span
                                    class="badge badge-sm bg-red-900/30 text-red-400 border-red-800"
                                    >Banned</span
                                >
                            {/if}

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-neutral-500 transition-transform duration-300 {expandedTeams[
                                    team.id
                                ]
                                    ? 'rotate-180'
                                    : ''}"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                    </button>

                    <!-- Accordion Body: Details -->
                    {#if expandedTeams[team.id]}
                        <div
                            class="px-6 pb-6 pt-2 border-t border-zinc-800/50 bg-zinc-900/20"
                        >
                            <div
                                class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
                            >
                                <!-- Details Column -->
                                <div>
                                    <h3
                                        class="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2"
                                    >
                                        Team Details
                                    </h3>
                                    <div class="space-y-3">
                                        <div
                                            class="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50"
                                        >
                                            <span class="text-neutral-400"
                                                >Level</span
                                            >
                                            <span
                                                class="badge bg-cyan-900/30 text-cyan-400 border-cyan-800 font-medium"
                                                >{team.level}</span
                                            >
                                        </div>

                                        <div
                                            class="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50"
                                        >
                                            <span class="text-neutral-400"
                                                >Status</span
                                            >
                                            {#if team.banned}
                                                <span
                                                    class="badge bg-red-900/30 text-red-400 border-red-800"
                                                    >Banned</span
                                                >
                                            {:else}
                                                <span
                                                    class="badge bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                                    >Active</span
                                                >
                                            {/if}
                                        </div>

                                        <div
                                            class="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50"
                                        >
                                            <span class="text-neutral-400"
                                                >GSV Verified</span
                                            >
                                            {#if team.gsv_verified}
                                                <span
                                                    class="badge bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                                    >Verified</span
                                                >
                                            {:else}
                                                <span class="text-neutral-500"
                                                    >—</span
                                                >
                                            {/if}
                                        </div>
                                    </div>
                                </div>

                                <!-- Members Column -->
                                <div>
                                    <h3
                                        class="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2"
                                    >
                                        Members ({team.members.length})
                                    </h3>
                                    <div
                                        class="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 space-y-2"
                                    >
                                        {#if team.members.length === 0}
                                            <p class="text-neutral-500 italic">
                                                No members found.
                                            </p>
                                        {:else}
                                            {#each team.members as m}
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <div
                                                        class="w-1.5 h-1.5 rounded-full bg-primary/50"
                                                    ></div>
                                                    <span
                                                        class="text-neutral-300"
                                                        >{m}</span
                                                    >
                                                </div>
                                            {/each}
                                        {/if}
                                    </div>

                                    <!-- Actions below members to save space -->
                                    <h3
                                        class="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6"
                                    >
                                        Actions
                                    </h3>
                                    <div class="flex gap-2 flex-wrap">
                                        {#if team.banned}
                                            <form
                                                method="POST"
                                                action="?/unban"
                                                use:enhance
                                            >
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={team.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="btn btn-sm bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-900/50 hover:border-emerald-500/50 transition-colors"
                                                >
                                                    Unban
                                                </button>
                                            </form>
                                        {:else}
                                            <form
                                                method="POST"
                                                action="?/ban"
                                                use:enhance
                                            >
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={team.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="btn btn-sm bg-orange-950/40 hover:bg-orange-900/60 text-orange-400 border-orange-900/50 hover:border-orange-500/50 transition-colors"
                                                >
                                                    Ban
                                                </button>
                                            </form>
                                        {/if}

                                        <form
                                            method="POST"
                                            action="?/delete"
                                            use:enhance
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={team.id}
                                            />
                                            <button
                                                type="submit"
                                                class="btn btn-sm bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/50 hover:border-red-500/50 transition-colors"
                                                on:click|preventDefault={(
                                                    e,
                                                ) => {
                                                    if (
                                                        confirm(
                                                            `Permanently delete team "${team.teamName}" and remove all members?`,
                                                        )
                                                    ) {
                                                        e.currentTarget
                                                            .closest("form")
                                                            ?.submit();
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            {/each}

            {#if filtered.length === 0}
                <div
                    class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl p-12 text-center text-neutral-500"
                >
                    {search ? "No teams match your search." : "No teams yet."}
                </div>
            {/if}
        </div>
    </div>
</div>
