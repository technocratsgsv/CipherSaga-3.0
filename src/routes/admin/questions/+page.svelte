<script lang="ts">
    import { enhance } from "$app/forms";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    export let form;

    let editingQuestion: any = null;
    let showCreateForm = false;

    function startEdit(q: any) {
        editingQuestion = { ...q };
    }
    function cancelEdit() {
        editingQuestion = null;
    }
</script>

<svelte:head>
    <title>Questions — Admin | CipherSaga</title>
</svelte:head>

<div
    class="relative min-h-screen w-full flex-col items-center justify-start antialiased p-8 z-0 overflow-y-auto"
>
    <div class="fixed inset-0 z-[-1]">
        <BackgroundBeams />
    </div>

    <!-- Header -->
    <div
        class="flex items-center justify-between mb-6 relative z-10 max-w-5xl mx-auto"
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
                 Question Management
            </h1>
        </div>
        <button
            class="btn btn-sm bg-primary text-black hover:bg-primary/80 border-none transition-colors"
            on:click={() => (showCreateForm = !showCreateForm)}
        >
            {showCreateForm ? " Cancel" : "+ Add Question"}
        </button>
    </div>

    <!-- Success / Error alerts -->
    <div class="max-w-5xl mx-auto relative z-10">
        {#if form?.success}
            <div
                class="alert bg-emerald-950/50 border border-emerald-900 text-emerald-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span> Operation successful!</span>
            </div>
        {/if}
        {#if form?.createError || form?.updateError || form?.deleteError}
            <div
                class="alert bg-red-950/50 border border-red-900 text-red-200 mb-4 shadow-lg backdrop-blur-md"
            >
                <span
                    >{form?.createError ??
                        form?.updateError ??
                        form?.deleteError}</span
                >
            </div>
        {/if}

        <!-- Create question form -->
        {#if showCreateForm}
            <div
                class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl mb-6 backdrop-blur-md transition-all duration-300"
            >
                <div class="card-body">
                    <h2 class="card-title text-xl text-neutral-200">
                        New Question
                    </h2>
                    <form
                        method="POST"
                        action="?/create"
                        use:enhance
                        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div class="form-control sm:col-span-2">
                            <label class="label" for="create-prompt"
                                ><span class="label-text text-neutral-400"
                                    >Prompt / Question</span
                                ></label
                            >
                            <textarea
                                id="create-prompt"
                                name="prompt"
                                class="textarea textarea-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary h-24"
                                rows="2"
                                required
                            ></textarea>
                        </div>
                        <div class="form-control">
                            <label class="label" for="create-answer"
                                ><span class="label-text text-neutral-400"
                                    >Answer (lowercase)</span
                                ></label
                            >
                            <input
                                id="create-answer"
                                name="answer"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                        <div class="form-control">
                            <label class="label" for="create-level"
                                ><span class="label-text text-neutral-400"
                                    >Level Number</span
                                ></label
                            >
                            <input
                                id="create-level"
                                name="level"
                                type="number"
                                min="1"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                        <div class="form-control sm:col-span-2">
                            <label class="label" for="create-comment"
                                ><span class="label-text text-neutral-400"
                                    >Comment / Hint (optional)</span
                                ></label
                            >
                            <input
                                id="create-comment"
                                name="comment"
                                type="text"
                                class="input input-bordered bg-zinc-900 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div class="sm:col-span-2 flex justify-end mt-2">
                            <button
                                type="submit"
                                class="btn btn-primary btn-sm bg-primary text-black hover:bg-primary/80 border-none"
                                >Create Question</button
                            >
                        </div>
                    </form>
                </div>
            </div>
        {/if}

        <!-- Questions table -->
        <div
            class="card bg-zinc-950/80 border border-zinc-800 shadow-2xl overflow-x-auto backdrop-blur-sm"
        >
            <table class="table w-full text-neutral-300">
                <thead>
                    <tr class="border-b border-zinc-800 text-neutral-400">
                        <th>Level</th>
                        <th>Prompt</th>
                        <th>Answer</th>
                        <th>Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.questions as q (q.id)}
                        {#if editingQuestion?.id === q.id}
                            <!-- Inline edit row -->
                            <tr class="bg-zinc-900/50 border-b border-zinc-800">
                                <td colspan="5" class="p-0">
                                    <div class="p-4 border-l-2 border-primary">
                                        <form
                                            method="POST"
                                            action="?/update"
                                            use:enhance
                                            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={q.id}
                                            />
                                            <div
                                                class="form-control sm:col-span-2"
                                            >
                                                <label
                                                    class="label py-1"
                                                    for="edit-prompt-{q.id}"
                                                    ><span
                                                        class="label-text text-xs text-neutral-400"
                                                        >Prompt</span
                                                    ></label
                                                >
                                                <textarea
                                                    id="edit-prompt-{q.id}"
                                                    name="prompt"
                                                    class="textarea textarea-bordered textarea-sm bg-zinc-950 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                                    rows="2"
                                                    required
                                                    >{editingQuestion.prompt}</textarea
                                                >
                                            </div>
                                            <div class="form-control">
                                                <label
                                                    class="label py-1"
                                                    for="edit-answer-{q.id}"
                                                    ><span
                                                        class="label-text text-xs text-neutral-400"
                                                        >Answer</span
                                                    ></label
                                                >
                                                <input
                                                    id="edit-answer-{q.id}"
                                                    name="answer"
                                                    type="text"
                                                    value={editingQuestion.answer}
                                                    class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div class="form-control">
                                                <label
                                                    class="label py-1"
                                                    for="edit-level-{q.id}"
                                                    ><span
                                                        class="label-text text-xs text-neutral-400"
                                                        >Level</span
                                                    ></label
                                                >
                                                <input
                                                    id="edit-level-{q.id}"
                                                    name="level"
                                                    type="number"
                                                    value={editingQuestion.level}
                                                    class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div
                                                class="form-control sm:col-span-2"
                                            >
                                                <label
                                                    class="label py-1"
                                                    for="edit-comment-{q.id}"
                                                    ><span
                                                        class="label-text text-xs text-neutral-400"
                                                        >Comment</span
                                                    ></label
                                                >
                                                <input
                                                    id="edit-comment-{q.id}"
                                                    name="comment"
                                                    type="text"
                                                    value={editingQuestion.comment ??
                                                        ""}
                                                    class="input input-bordered input-sm bg-zinc-950 border-zinc-700 text-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div
                                                class="sm:col-span-2 flex gap-2 justify-end mt-2"
                                            >
                                                <button
                                                    type="button"
                                                    class="btn btn-ghost btn-sm text-neutral-400 hover:text-white hover:bg-zinc-800"
                                                    on:click={cancelEdit}
                                                    >Cancel</button
                                                >
                                                <button
                                                    type="submit"
                                                    class="btn btn-primary btn-sm bg-primary text-black hover:bg-primary/80 border-none"
                                                    >Save Changes</button
                                                >
                                            </div>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr
                                class="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                            >
                                <td
                                    ><span
                                        class="badge badge-sm bg-primary/20 text-primary border-primary/30 font-medium"
                                        >{q.level}</span
                                    ></td
                                >
                                <td
                                    class="max-w-xs truncate text-neutral-200 font-medium"
                                    title={q.prompt}>{q.prompt}</td
                                >
                                <td
                                    ><code
                                        class="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-emerald-400 text-sm font-mono"
                                        >{q.answer}</code
                                    ></td
                                >
                                <td
                                    class="max-w-xs truncate text-neutral-500 text-sm"
                                    title={q.comment}>{q.comment || "—"}</td
                                >
                                <td>
                                    <div class="flex gap-2">
                                        <button
                                            class="btn btn-xs bg-zinc-800 hover:bg-zinc-700 text-neutral-300 border-zinc-700 hover:border-zinc-600 transition-colors"
                                            on:click={() => startEdit(q)}
                                            > Edit</button
                                        >
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
                                                class="btn btn-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/50 hover:border-red-500/50 transition-colors"
                                                on:click|preventDefault={(
                                                    e,
                                                ) => {
                                                    if (
                                                        confirm(
                                                            `Delete level ${q.level}: "${q.prompt}"?`,
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
                        {/if}
                    {/each}
                    {#if data.questions.length === 0}
                        <tr
                            ><td
                                colspan="5"
                                class="text-center text-neutral-500 py-12"
                                >No questions yet. Add one above!</td
                            ></tr
                        >
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
