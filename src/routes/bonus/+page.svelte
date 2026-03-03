<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { fade, fly, slide } from "svelte/transition";
    import { sendErrorToast, sendSuccessToast } from "$lib/toast_utils";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    export let data;

    let submitting = false;
    let answerInput = "";
    let activeQuestionId: string | null = null;
    let isSubmittingMap: Record<string, boolean> = {};

    // Check for success param from scan redirect
    onMount(() => {
        if ($page.url.searchParams.get("new")) {
            // Simply remove the param cleanly without reload if possible, or just ignore
            const url = new URL(window.location.href);
            url.searchParams.delete("new");
            window.history.replaceState({}, "", url);
            // Data is already reloaded by the navigation to this page
        }
    });

    async function handleSubmit(questionId: string) {
        if (!answerInput.trim()) return;
        isSubmittingMap[questionId] = true;

        try {
            const res = await fetch("/api/bonus/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId,
                    answer: answerInput,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                sendSuccessToast(
                    "Correct!",
                    "Points have been added to your team.",
                );
                answerInput = "";
                activeQuestionId = null; // Close the accordion/input
                await invalidateAll(); // Refresh to see "Solved" status
            } else {
                sendErrorToast(
                    "Incorrect",
                    result.message || "That answer is wrong.",
                );
            }
        } catch (err) {
            console.error(err);
            sendErrorToast("Error", "Failed to submit answer.");
        } finally {
            isSubmittingMap[questionId] = false;
        }
    }

    function toggleQuestion(id: string) {
        if (activeQuestionId === id) {
            activeQuestionId = null;
        } else {
            activeQuestionId = id;
            answerInput = ""; // reset input
        }
    }

    $: questions = (data.questions || []).filter(
        (q: any) => q !== null && q !== undefined,
    ) as any[];
</script>

<div
    class="min-h-screen pt-20 px-4 pb-20 bg-zinc-950 text-white font-mono selection:bg-purple-500/30"
>
    <!-- Background Gradients -->
    <div class="fixed inset-0 pointer-events-none">
        <div
            class="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"
        ></div>
        <div
            class="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[80px]"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1
                class="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x tracking-tight mb-4"
            >
                Bonus Hunt
            </h1>
            <p class="text-zinc-400 text-lg max-w-2xl mx-auto">
                Scan hidden QR codes around campus to unlock clues. Be the first
                to solve them for massive points.
            </p>
        </div>

        <!-- Scanner Access -->
        <div class="flex justify-center mb-12">
            <a
                href="/bonus/scan"
                class="group relative px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800/50 backdrop-blur-md rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            >
                <div class="flex items-center gap-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                    </svg>
                    <span class="font-bold text-zinc-200 group-hover:text-white"
                        >Open Scanner</span
                    >
                </div>
            </a>
        </div>

        <!-- Questions Grid -->
        {#if data.questions.length === 0}
            <div
                class="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 backdrop-blur-sm"
            >
                <p class="text-2xl text-zinc-500 font-light">
                    No active bonus questions detected.
                </p>
                <p class="text-zinc-600 mt-2">Stay alert for new drops.</p>
            </div>
        {:else}
            <div class="grid gap-6">
                {#each questions as q, index (q.id)}
                    <div
                        in:fly={{ y: 20, delay: index * 100 }}
                        class="relative group rounded-2xl overflow-hidden transition-all duration-300 border
                        {q.isSolvedByMe
                            ? 'bg-gradient-to-br from-green-900/20 to-zinc-900/50 border-green-500/30 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]'
                            : q.isUnlocked
                              ? 'bg-zinc-900/60 hover:bg-zinc-800/60 border-purple-500/40 hover:border-purple-400 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]'
                              : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'}
                        "
                    >
                        <!-- Status Badge -->
                        <div class="absolute top-4 right-4 z-20">
                            {#if q.isSolvedByMe}
                                <span
                                    class="badge badge-success gap-1 font-bold shadow-lg"
                                >
                                    SOLVED
                                </span>
                            {:else if q.isUnlocked}
                                <span
                                    class="badge badge-accent gap-1 font-bold shadow-lg animate-pulse"
                                >
                                    UNLOCKED
                                </span>
                            {:else}
                                <span
                                    class="badge badge-ghost gap-1 text-zinc-500 border-zinc-700"
                                >
                                    LOCKED
                                </span>
                            {/if}
                        </div>

                        <div class="p-6 md:p-8">
                            <div class="flex items-start gap-4">
                                <div class="mt-1">
                                    {#if q.isSolvedByMe}
                                        <div
                                            class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/50"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    {:else if q.isUnlocked}
                                        <div
                                            class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/50"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                />
                                            </svg>
                                        </div>
                                    {:else}
                                        <div
                                            class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </div>
                                    {/if}
                                </div>

                                <div class="flex-1">
                                    <h3
                                        class="text-xl md:text-2xl font-bold text-zinc-100 mb-2"
                                    >
                                        {q.title || "Mystery Bonus"}
                                    </h3>
                                    <p
                                        class="text-zinc-400 text-sm md:text-base leading-relaxed mb-4"
                                    >
                                        {q.description ||
                                            "A challenge awaits those who find the code."}
                                    </p>

                                    <div
                                        class="flex items-center gap-4 text-xs font-bold tracking-wider uppercase"
                                    >
                                        {#if q.isSolvedByMe}
                                            <span class="text-green-400"
                                                >Value: {q.points} PTS</span
                                            >
                                        {:else}
                                            <span class="text-purple-400"
                                                >Reward: {q.points} PTS</span
                                            >
                                        {/if}

                                        {#if !q.isUnlocked && !q.isSolvedByMe}
                                            <span
                                                class="text-zinc-600 flex items-center gap-1"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="h-3 w-3"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                                Find QR to Unclock
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Area (Accordion) -->
                        {#if q.isUnlocked && !q.isSolvedByMe}
                            <div
                                class="border-t border-zinc-700/50 bg-black/20"
                            >
                                <button
                                    class="w-full px-8 py-3 flex items-center justify-between text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                    on:click={() => toggleQuestion(q.id)}
                                >
                                    <span
                                        >{activeQuestionId === q.id
                                            ? "CLOSE INTERFACE"
                                            : "OPEN INTERFACE"}</span
                                    >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5 transition-transform duration-300 {activeQuestionId ===
                                        q.id
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
                                </button>

                                {#if activeQuestionId === q.id}
                                    <div class="p-8 pt-2" transition:slide>
                                        <!-- HINT -->
                                        <div
                                            class="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 mb-6 shadow-inner"
                                        >
                                            <h4
                                                class="text-purple-400 text-xs font-bold uppercase mb-2"
                                            >
                                                Decrypted Clue
                                            </h4>
                                            <p
                                                class="text-zinc-200 italic font-medium"
                                            >
                                                {q.hint}
                                            </p>
                                        </div>

                                        <!-- INPUT -->
                                        <div
                                            class="flex flex-col md:flex-row gap-4"
                                        >
                                            <input
                                                type="text"
                                                class="input input-bordered flex-1 bg-black/40 border-zinc-700 focus:border-purple-500 focus:outline-none text-white placeholder-zinc-600"
                                                placeholder="Enter the answer..."
                                                bind:value={answerInput}
                                                on:keydown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSubmit(q.id)}
                                            />
                                            <button
                                                class="btn btn-primary bg-purple-600 hover:bg-purple-500 border-none text-white px-8"
                                                disabled={isSubmittingMap[
                                                    q.id
                                                ] || !answerInput}
                                                on:click={() =>
                                                    handleSubmit(q.id)}
                                            >
                                                {#if isSubmittingMap[q.id]}
                                                    <span
                                                        class="loading loading-spinner loading-xs"
                                                    ></span>
                                                {:else}
                                                    Submit
                                                {/if}
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    /* Custom Scrollbar for this page if needed */
    :global(body) {
        background-color: #09090b; /* zinc-950 */
    }
</style>
