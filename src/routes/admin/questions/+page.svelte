<script lang="ts">
    import { enhance } from '$app/forms';
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

<div class="min-h-screen bg-base-200 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <a href="/admin" class="text-sm text-base-content/50 hover:underline">← Dashboard</a>
            <h1 class="text-3xl font-bold mt-1">📋 Question Management</h1>
        </div>
        <button class="btn btn-primary" on:click={() => (showCreateForm = !showCreateForm)}>
            {showCreateForm ? '✕ Cancel' : '+ Add Question'}
        </button>
    </div>

    <!-- Success / Error alerts -->
    {#if form?.success}
        <div class="alert alert-success mb-4"><span>✅ Operation successful!</span></div>
    {/if}
    {#if form?.createError || form?.updateError || form?.deleteError}
        <div class="alert alert-error mb-4">
            <span>{form?.createError ?? form?.updateError ?? form?.deleteError}</span>
        </div>
    {/if}

    <!-- Create question form -->
    {#if showCreateForm}
        <div class="card bg-base-100 shadow-lg mb-6">
            <div class="card-body">
                <h2 class="card-title">New Question</h2>
                <form method="POST" action="?/create" use:enhance class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="form-control sm:col-span-2">
                        <label class="label" for="create-prompt"><span class="label-text">Prompt / Question</span></label>
                        <textarea id="create-prompt" name="prompt" class="textarea textarea-bordered" rows="2" required></textarea>
                    </div>
                    <div class="form-control">
                        <label class="label" for="create-answer"><span class="label-text">Answer (lowercase)</span></label>
                        <input id="create-answer" name="answer" type="text" class="input input-bordered" required />
                    </div>
                    <div class="form-control">
                        <label class="label" for="create-level"><span class="label-text">Level Number</span></label>
                        <input id="create-level" name="level" type="number" min="1" class="input input-bordered" required />
                    </div>
                    <div class="form-control sm:col-span-2">
                        <label class="label" for="create-comment"><span class="label-text">Comment / Hint (optional)</span></label>
                        <input id="create-comment" name="comment" type="text" class="input input-bordered" />
                    </div>
                    <div class="sm:col-span-2 flex justify-end">
                        <button type="submit" class="btn btn-primary">Create Question</button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Questions table -->
    <div class="card bg-base-100 shadow-lg overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
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
                        <tr class="bg-base-200">
                            <td colspan="5">
                                <form method="POST" action="?/update" use:enhance class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                                    <input type="hidden" name="id" value={q.id} />
                                    <div class="form-control sm:col-span-2">
                                        <label class="label" for="edit-prompt-{q.id}"><span class="label-text">Prompt</span></label>
                                        <textarea id="edit-prompt-{q.id}" name="prompt" class="textarea textarea-bordered" rows="2" required>{editingQuestion.prompt}</textarea>
                                    </div>
                                    <div class="form-control">
                                        <label class="label" for="edit-answer-{q.id}"><span class="label-text">Answer</span></label>
                                        <input id="edit-answer-{q.id}" name="answer" type="text" value={editingQuestion.answer} class="input input-bordered" required />
                                    </div>
                                    <div class="form-control">
                                        <label class="label" for="edit-level-{q.id}"><span class="label-text">Level</span></label>
                                        <input id="edit-level-{q.id}" name="level" type="number" value={editingQuestion.level} class="input input-bordered" required />
                                    </div>
                                    <div class="form-control sm:col-span-2">
                                        <label class="label" for="edit-comment-{q.id}"><span class="label-text">Comment</span></label>
                                        <input id="edit-comment-{q.id}" name="comment" type="text" value={editingQuestion.comment ?? ''} class="input input-bordered" />
                                    </div>
                                    <div class="sm:col-span-2 flex gap-2 justify-end">
                                        <button type="button" class="btn btn-ghost btn-sm" on:click={cancelEdit}>Cancel</button>
                                        <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
                                    </div>
                                </form>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td><span class="badge badge-primary">{q.level}</span></td>
                            <td class="max-w-xs truncate" title={q.prompt}>{q.prompt}</td>
                            <td><code class="bg-base-300 px-2 py-0.5 rounded text-success">{q.answer}</code></td>
                            <td class="max-w-xs truncate text-base-content/60" title={q.comment}>{q.comment || '—'}</td>
                            <td>
                                <div class="flex gap-2">
                                    <button class="btn btn-xs btn-outline" on:click={() => startEdit(q)}>✏️ Edit</button>
                                    <form method="POST" action="?/delete" use:enhance>
                                        <input type="hidden" name="id" value={q.id} />
                                        <button
                                            type="submit"
                                            class="btn btn-xs btn-error btn-outline"
                                            on:click|preventDefault={(e) => {
                                                if (confirm(`Delete level ${q.level}: "${q.prompt}"?`)) {
                                                    (e.target as HTMLButtonElement).closest('form')?.submit();
                                                }
                                            }}
                                        >🗑️ Delete</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/if}
                {/each}
                {#if data.questions.length === 0}
                    <tr><td colspan="5" class="text-center text-base-content/50 py-8">No questions yet. Add one above!</td></tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
