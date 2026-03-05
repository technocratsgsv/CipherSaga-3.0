<script lang="ts">
    import { enhance } from "$app/forms";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    export let form;

    let search = "";
    $: filtered = data.teams.filter((t: any) =>
        t.teamName.toLowerCase().includes(search.toLowerCase()),
    );
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
        class="flex items-center justify-between mb-6 relative z-10 max-w-6xl mx-auto"
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
            class="input input-bordered w-64 bg-zinc-950/80 border-zinc-700 text-neutral-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-md"
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

        <div
            class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl overflow-x-auto backdrop-blur-sm"
        >
            <table class="table w-full text-neutral-300">
                <thead>
                    <tr class="border-b border-zinc-800 text-neutral-400">
                        <th>Team Name</th>
                        <th>Members</th>
                        <th>Level</th>
                        <th>GSV Verified</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filtered as team (team.id)}
                        <tr
                            class="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors {team.banned
                                ? 'opacity-50 grayscale'
                                : ''}"
                        >
                            <td class="font-semibold text-neutral-200"
                                >{team.teamName}</td
                            >
                            <td>
                                <div class="flex flex-col gap-0.5">
                                    {#each team.members as m}
                                        <span
                                            class="text-xs text-neutral-500 font-mono"
                                            >{m}</span
                                        >
                                    {/each}
                                </div>
                            </td>
                            <td>
                                <span
                                    class="badge badge-sm bg-cyan-900/30 text-cyan-400 border-cyan-800 font-medium"
                                    >{team.level}</span
                                >
                            </td>
                            <td>
                                {#if team.gsv_verified}
                                    <span
                                        class="badge badge-sm bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                        > GSV</span
                                    >
                                {:else}
                                    <span
                                        class="badge badge-sm bg-zinc-800/50 text-neutral-500 border-zinc-700"
                                        >—</span
                                    >
                                {/if}
                            </td>
                            <td>
                                {#if team.banned}
                                    <span
                                        class="badge badge-sm bg-red-900/30 text-red-400 border-red-800"
                                        >Banned</span
                                    >
                                {:else}
                                    <span
                                        class="badge badge-sm bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                        >Active</span
                                    >
                                {/if}
                            </td>
                            <td>
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
                                                class="btn btn-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-900/50 hover:border-emerald-500/50 transition-colors"
                                                > Unban</button
                                            >
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
                                                class="btn btn-xs bg-orange-950/40 hover:bg-orange-900/60 text-orange-400 border-orange-900/50 hover:border-orange-500/50 transition-colors"
                                                > Ban</button
                                            >
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
                                            class="btn btn-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/50 hover:border-red-500/50 transition-colors"
                                            on:click|preventDefault={(e) => {
                                                if (
                                                    confirm(
                                                        `Permanently delete team "${team.teamName}" and remove all members?`,
                                                    )
                                                ) {
                                                    e.currentTarget
                                                        .closest("form")
                                                        ?.submit();
                                                }
                                            }}> Delete</button
                                        >
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                    {#if filtered.length === 0}
                        <tr>
                            <td
                                colspan="6"
                                class="text-center text-neutral-500 py-12"
                            >
                                {search
                                    ? "No teams match your search."
                                    : "No teams yet."}
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
