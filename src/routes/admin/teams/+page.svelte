<script lang="ts">
    import { enhance } from "$app/forms";
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

<div class="min-h-screen bg-base-200 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <a
                href="/admin"
                class="text-sm text-base-content/50 hover:underline"
                >← Dashboard</a
            >
            <h1 class="text-3xl font-bold mt-1">👥 Team Management</h1>
            <p class="text-base-content/60 mt-1 text-sm">
                {data.teams.length} teams total
            </p>
        </div>
        <input
            type="text"
            bind:value={search}
            placeholder="Search teams..."
            class="input input-bordered w-64"
            id="team-search"
        />
    </div>

    {#if form?.success}
        <div class="alert alert-success mb-4">
            <span>✅ Team updated successfully.</span>
        </div>
    {/if}
    {#if form?.error}
        <div class="alert alert-error mb-4"><span>{form.error}</span></div>
    {/if}

    <div class="card bg-base-100 shadow-lg overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
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
                    <tr class={team.banned ? "opacity-60" : ""}>
                        <td class="font-semibold">{team.teamName}</td>
                        <td>
                            <div class="flex flex-col gap-0.5">
                                {#each team.members as m}
                                    <span
                                        class="text-xs text-base-content/60 font-mono"
                                        >{m}</span
                                    >
                                {/each}
                            </div>
                        </td>
                        <td>
                            <span class="badge badge-primary">{team.level}</span
                            >
                        </td>
                        <td>
                            {#if team.gsv_verified}
                                <span class="badge badge-success badge-sm"
                                    >✓ GSV</span
                                >
                            {:else}
                                <span class="badge badge-ghost badge-sm">—</span
                                >
                            {/if}
                        </td>
                        <td>
                            {#if team.banned}
                                <span class="badge badge-error">Banned</span>
                            {:else}
                                <span class="badge badge-success">Active</span>
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
                                            class="btn btn-xs btn-success btn-outline"
                                            >✅ Unban</button
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
                                            class="btn btn-xs btn-warning btn-outline"
                                            >🚫 Ban</button
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
                                        class="btn btn-xs btn-error btn-outline"
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
                                        }}>🗑️ Delete</button
                                    >
                                </form>
                            </div>
                        </td>
                    </tr>
                {/each}
                {#if filtered.length === 0}
                    <tr
                        ><td
                            colspan="6"
                            class="text-center text-base-content/50 py-8"
                        >
                            {search
                                ? "No teams match your search."
                                : "No teams yet."}
                        </td></tr
                    >
                {/if}
            </tbody>
        </table>
    </div>
</div>
