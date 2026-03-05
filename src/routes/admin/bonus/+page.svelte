<script lang="ts">
    import { enhance } from "$app/forms";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    export let form;

    let editingQ: any = null;
    let showCreateForm = false;

    function startEdit(q: any) {
        editingQ = { ...q };
    }
    function cancelEdit() {
        editingQ = null;
    }
</script>

<svelte:head>
    <title>Bonus Questions — Admin | CipherSaga</title>
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
                 Bonus Question Management
            </h1>
            <p class="text-neutral-500 text-sm mt-1">
                {data.questions.length} bonus questions
            </p>
        </div>
        <button
            class="btn btn-sm bg-primary text-black hover:bg-primary/80 border-none transition-colors"
            on:click={() => (showCreateForm = !showCreateForm)}
        >
            {showCreateForm ? " Cancel" : "+ Add Bonus Question"}
        </button>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
        <!-- Alerts -->
        {#if form?.success}
            <div
                class="alert bg-emerald-950/50 border border-emerald-900 text-emerald-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span> Operation successful!</span>
            </div>
        {/if}
        {#if form?.createError || form?.updateError || form?.deleteError || form?.resetError}
            <div
                class="alert bg-red-950/50 border border-red-900 text-red-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span
                    >{form?.createError ??
                        form?.updateError ??
                        form?.deleteError ??
                        form?.resetError}</span
                >
            </div>
        {/if}

        <!-- Create Form -->
        {#if showCreateForm}
            <div
                class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl mb-6 backdrop-blur-md"
            >
                <div class="card-body">
                    <h2 class="card-title text-xl text-neutral-200">
                        New Bonus Question
                    </h2>
                    <form
                        method="POST"
                        action="?/create"
                        use:enhance
                        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div class="form-control sm:col-span-2">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Title</span
                                ></label
                            >
                            <input
                                name="title"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                                required
                            />
                        </div>
                        <div class="form-control sm:col-span-2">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Description / Question</span
                                ></label
                            >
                            <textarea
                                name="description"
                                class="textarea textarea-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary h-20"
                                required
                            ></textarea>
                        </div>
                        <div class="form-control sm:col-span-2">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Hint (optional)</span
                                ></label
                            >
                            <input
                                name="hint"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                            />
                        </div>
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Answer (lowercase)</span
                                ></label
                            >
                            <input
                                name="answer"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                                required
                            />
                        </div>
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >QR String (unique key)</span
                                ></label
                            >
                            <input
                                name="qrString"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                                required
                            />
                        </div>
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Points (on solve)</span
                                ></label
                            >
                            <input
                                name="points"
                                type="number"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                                required
                            />
                        </div>
                        <div class="form-control">
                            <label class="label"
                                ><span class="label-text text-neutral-400"
                                    >Negative Points (on wrong)</span
                                ></label
                            >
                            <input
                                name="negative_points"
                                type="number"
                                value="0"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary"
                            />
                        </div>
                        <div class="sm:col-span-2 flex justify-end mt-2">
                            <button
                                type="submit"
                                class="btn btn-primary btn-sm bg-primary text-black hover:bg-primary/80 border-none"
                                >Create</button
                            >
                        </div>
                    </form>
                </div>
            </div>
        {/if}

        <!-- Questions -->
        <div class="flex flex-col gap-4">
            {#each data.questions as q (q.id)}
                {#if editingQ?.id === q.id}
                    <!-- Edit Card -->
                    <div
                        class="card bg-zinc-950/80 border border-primary/40 shadow-2xl backdrop-blur-sm"
                    >
                        <div class="card-body">
                            <h3
                                class="text-lg font-semibold text-neutral-200 mb-2"
                            >
                                 Editing: {q.title}
                            </h3>
                            <form
                                method="POST"
                                action="?/update"
                                use:enhance
                                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                <input type="hidden" name="id" value={q.id} />
                                <div class="form-control sm:col-span-2">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Title</span
                                        ></label
                                    >
                                    <input
                                        name="title"
                                        type="text"
                                        value={editingQ.title}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                        required
                                    />
                                </div>
                                <div class="form-control sm:col-span-2">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Description</span
                                        ></label
                                    >
                                    <textarea
                                        name="description"
                                        class="textarea textarea-bordered textarea-sm bg-zinc-950 border-zinc-700 text-neutral-200 h-16"
                                        required
                                        >{editingQ.description}</textarea
                                    >
                                </div>
                                <div class="form-control sm:col-span-2">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Hint</span
                                        ></label
                                    >
                                    <input
                                        name="hint"
                                        type="text"
                                        value={editingQ.hint}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Answer</span
                                        ></label
                                    >
                                    <input
                                        name="answer"
                                        type="text"
                                        value={editingQ.answer}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                        required
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >QR String</span
                                        ></label
                                    >
                                    <input
                                        name="qrString"
                                        type="text"
                                        value={editingQ.qrString}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                        required
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Points</span
                                        ></label
                                    >
                                    <input
                                        name="points"
                                        type="number"
                                        value={editingQ.points}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                        required
                                    />
                                </div>
                                <div class="form-control">
                                    <label class="label"
                                        ><span
                                            class="label-text text-xs text-neutral-400"
                                            >Negative Points</span
                                        ></label
                                    >
                                    <input
                                        name="negative_points"
                                        type="number"
                                        value={editingQ.negative_points}
                                        class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200"
                                    />
                                </div>
                                <div
                                    class="sm:col-span-2 flex gap-2 justify-end mt-2"
                                >
                                    <button
                                        type="button"
                                        class="btn btn-ghost btn-sm text-neutral-400 hover:bg-zinc-800"
                                        on:click={cancelEdit}>Cancel</button
                                    >
                                    <button
                                        type="submit"
                                        class="btn btn-primary btn-sm bg-primary text-black hover:bg-primary/80 border-none"
                                        >Save</button
                                    >
                                </div>
                            </form>
                        </div>
                    </div>
                {:else}
                    <!-- View Card -->
                    <div
                        class="card bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-sm hover:border-zinc-700 transition-colors"
                    >
                        <div class="card-body py-4">
                            <div
                                class="flex items-start justify-between flex-wrap gap-3"
                            >
                                <div class="flex-1 min-w-0">
                                    <div
                                        class="flex items-center gap-3 flex-wrap"
                                    >
                                        <h3
                                            class="text-lg font-semibold text-neutral-200"
                                        >
                                            {q.title}
                                        </h3>
                                        <span
                                            class="badge badge-sm bg-primary/20 text-primary border-primary/30"
                                            >{q.points} pts</span
                                        >
                                        {#if q.negative_points}
                                            <span
                                                class="badge badge-sm bg-red-900/30 text-red-400 border-red-800"
                                                >-{q.negative_points} pts on wrong</span
                                            >
                                        {/if}
                                        {#if q.isVisible}
                                            <span
                                                class="badge badge-sm bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                                > Visible</span
                                            >
                                        {:else}
                                            <span
                                                class="badge badge-sm bg-zinc-800 text-neutral-500 border-zinc-700"
                                                > Hidden</span
                                            >
                                        {/if}
                                        {#if q.isSolved}
                                            <span
                                                class="badge badge-sm bg-amber-900/30 text-amber-400 border-amber-800"
                                                > Solved</span
                                            >
                                        {/if}
                                    </div>
                                    <p
                                        class="text-neutral-400 text-sm mt-1 line-clamp-2"
                                    >
                                        {q.description}
                                    </p>
                                    <div
                                        class="flex gap-6 mt-2 flex-wrap text-xs text-neutral-500"
                                    >
                                        <span
                                            > Answer: <code
                                                class="text-emerald-400 font-mono"
                                                >{q.answer}</code
                                            ></span
                                        >
                                        <span
                                            > QR: <code
                                                class="text-cyan-400 font-mono"
                                                >{q.qrString}</code
                                            ></span
                                        >
                                        <span
                                            > Scanned by:
                                            {#if q.scannedByCount === 0}
                                                <span class="text-neutral-600"
                                                    >—</span
                                                >
                                            {:else}
                                                <details
                                                    class="inline-block align-middle"
                                                >
                                                    <summary
                                                        class="cursor-pointer text-cyan-400 font-medium hover:text-cyan-300 transition-colors list-none inline"
                                                    >
                                                        {q.scannedByCount} team{q.scannedByCount !==
                                                        1
                                                            ? "s"
                                                            : ""} ▾
                                                    </summary>
                                                    <div
                                                        class="flex flex-wrap gap-1 mt-1.5"
                                                    >
                                                        {#each q.scannedByTeams as teamName}
                                                            <span
                                                                class="badge badge-xs bg-cyan-900/30 text-cyan-400 border-cyan-800 font-mono"
                                                                >{teamName}</span
                                                            >
                                                        {/each}
                                                    </div>
                                                </details>
                                            {/if}
                                        </span>
                                        {#if q.isSolved && q.solvedByTeamName}
                                            <span
                                                > Solved by: <span
                                                    class="text-amber-400 font-medium"
                                                    >{q.solvedByTeamName}</span
                                                ></span
                                            >
                                        {/if}
                                        {#if q.solvedAt}
                                            <span
                                                > At: <span
                                                    class="text-neutral-300"
                                                    >{new Date(
                                                        q.solvedAt,
                                                    ).toLocaleString()}</span
                                                ></span
                                            >
                                        {/if}
                                    </div>
                                    {#if q.hint}
                                        <p
                                            class="text-xs text-neutral-500 mt-1"
                                        >
                                             Hint: {q.hint}
                                        </p>
                                    {/if}
                                </div>
                                <!-- Actions -->
                                <div class="flex gap-2 flex-wrap items-start">
                                    <button
                                        class="btn btn-xs bg-zinc-800 hover:bg-zinc-700 text-neutral-300 border-zinc-700 transition-colors"
                                        on:click={() => startEdit(q)}
                                        > Edit</button
                                    >
                                    <form
                                        method="POST"
                                        action="?/toggleVisible"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={q.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="isVisible"
                                            value={String(q.isVisible)}
                                        />
                                        <button
                                            type="submit"
                                            class="btn btn-xs bg-zinc-800 hover:bg-zinc-700 text-neutral-300 border-zinc-700 transition-colors"
                                        >
                                            {q.isVisible
                                                ? " Hide"
                                                : " Show"}
                                        </button>
                                    </form>
                                    {#if q.isSolved}
                                        <form
                                            method="POST"
                                            action="?/reset"
                                            use:enhance
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={q.id}
                                            />
                                            <button
                                                type="submit"
                                                class="btn btn-xs bg-orange-950/40 hover:bg-orange-900/60 text-orange-400 border-orange-900/50 transition-colors"
                                                > Reset</button
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
                                            value={q.id}
                                        />
                                        <button
                                            type="submit"
                                            class="btn btn-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/50 transition-colors"
                                            on:click|preventDefault={(e) => {
                                                if (
                                                    confirm(
                                                        `Delete bonus question "${q.title}"?`,
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
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
            {#if data.questions.length === 0}
                <div
                    class="card bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm"
                >
                    <div class="card-body text-center text-neutral-500 py-12">
                        No bonus questions yet. Add one above!
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
