<script lang="ts">
    import {
        ArrowLeft,
        ArrowRight,
        CheckCircleIcon,
        CircleXIcon,
        List,
        Lock,
        ArrowUpRight,
    } from "lucide-svelte";

    import { IconCoins, IconUsers } from "@tabler/icons-svelte";

    import { Input } from "@/components/ui/SignupForm";
    import { sendErrorToast, sendSuccessToast } from "@/toast_utils";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    let loading = false;

    export let data;

    let questions = data?.questions ?? [];
    let teamData = data?.teamData ?? {};
    let logs = data?.logs ?? [];

    let currQuestion = 0;

    $: currQuestionData = questions?.[currQuestion];

    const submitAnswer = async () => {
        if (!currQuestionData?.uid) return;

        const input = document.getElementById("answer") as HTMLInputElement;
        const cleanedAnswer = input?.value?.trim()?.toLowerCase() || "";

        console.log("Submitting:", cleanedAnswer);

        if (!cleanedAnswer) {
            sendErrorToast("Invalid answer", "Please enter an answer");
            return;
        }

        loading = true;

        const r = await fetch(`/api/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answer: cleanedAnswer,
                questionId: currQuestionData.uid,
            }),
        });

        if (r.ok) {
            const rdata = await r.json();

            if (rdata.correct) {
                sendSuccessToast("Level cleared", "Your answer was correct");

                if (input) input.value = "";

                // update score immediately
                teamData.level = (teamData.level || 0) + 1;

                // update solved levels
                teamData.completed_levels = [
                    ...(teamData.completed_levels || []),
                    currQuestionData.uid,
                ];

                // update logs instantly
                logs = [
                    {
                        type: "correct_answer",
                        entered: cleanedAnswer,
                    },
                    ...logs,
                ];

                if (currQuestion < questions.length - 1) {
                    currQuestion++;
                }
            } else {
                sendErrorToast("Wrong answer", "Give it another shot");

                // update logs instantly
                logs = [
                    {
                        type: "wrong_answer",
                        entered: cleanedAnswer,
                    },
                    ...logs,
                ];
            }
        } else {
            console.error(await r.text());
            sendErrorToast("Error submitting", "Something went wrong");
        }

        loading = false;
    };

    const updateComment = () => {
        if (!currQuestionData) return;

        if (browser) {
            const e = document.getElementById(";)");

            if (e) {
                e.innerHTML = "";
                e.appendChild(document.createComment(currQuestionData.comment));
            }
        }
    };

    const showLogsModal = () => {
        (
            document.getElementById("logsModal") as HTMLDialogElement
        )?.showModal();
    };

    $: currQuestionData, updateComment();
</script>

<title>Cipher Saga 3.0 - Play</title>

{#if questions?.length > 0}
    <div class="navbar bg-base-100/50 backdrop-blur-md sticky top-0 z-50">
        <div class="navbar-start w-auto flex-1">
            <a
                class="btn btn-ghost text-md shrink-0 px-2 md:px-4"
                class:text-primary={$page.url.pathname === "/"}
                href="/"
            >
                <ArrowUpRight class="w-4 h-4 md:w-6 md:h-6" />
                <span class="hidden md:inline">Home</span>
            </a>
        </div>

        <div
            class="navbar-center flex items-center justify-center space-x-1 md:space-x-2"
        >
            <button
                class="btn btn-square btn-sm md:btn-md shrink-0"
                disabled={currQuestion === 0}
                on:click={() => currQuestion > 0 && currQuestion--}
            >
                <ArrowLeft class="w-4 h-4 md:w-6 md:h-6" />
            </button>

            <span
                class="btn btn-ghost text-sm md:text-xl shrink-0 px-2"
                class:text-primary={(teamData.completed_levels || []).includes(
                    currQuestionData?.uid,
                )}
            >
                Level {currQuestionData?.level}/{questions.length}
            </span>

            <button
                class="btn btn-square btn-sm md:btn-md shrink-0"
                on:click={() =>
                    currQuestion < questions.length - 1 && currQuestion++}
                disabled={currQuestion === questions.length - 1 ||
                    !(teamData.completed_levels || []).includes(
                        currQuestionData?.uid,
                    )}
            >
                {#if !(teamData.completed_levels || []).includes(currQuestionData?.uid)}
                    <Lock class="w-4 h-4 md:w-6 md:h-6" />
                {:else}
                    <ArrowRight class="w-4 h-4 md:w-6 md:h-6" />
                {/if}
            </button>
        </div>

        <div class="navbar-end w-auto flex-1 justify-end">
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h8m-8 6h16"
                        /></svg
                    >
                </div>
                <ul
                    tabindex="0"
                    class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-48 border border-zinc-800"
                >
                    <li>
                        <a class="py-3"
                            ><IconUsers class="w-5 h-5" />
                            {teamData.teamName}</a
                        >
                    </li>
                    <li>
                        <a class="py-3"
                            ><IconCoins class="w-5 h-5" />
                            {(teamData.level || 1) * 100 - 100} Coins</a
                        >
                    </li>
                    <li>
                        <button
                            class="py-3 font-medium"
                            on:click={showLogsModal}
                            ><List class="w-5 h-5" /> Prev Answers</button
                        >
                    </li>
                </ul>
            </div>
            <div class="hidden lg:flex">
                <button class="btn btn-ghost mr-2 shrink-0">
                    <IconUsers />
                    {teamData.teamName}
                </button>
                <button class="btn btn-ghost mr-2 shrink-0">
                    <IconCoins />
                    {(teamData.level || 1) * 100 - 100}
                </button>
                <button class="btn btn-ghost shrink-0" on:click={showLogsModal}>
                    <List /> Prev Answers
                </button>
            </div>
        </div>
    </div>

    <center>
        <p class="text-4xl mb-4">{currQuestionData?.prompt}</p>

        {#if currQuestionData?.files?.length}
            <div>
                <p class="text-lg font-medium">Files</p>

                {#each currQuestionData.files as f}
                    <span
                        class="link link-primary"
                        on:click={() => open(f.url)}
                    >
                        {f.name}
                    </span>
                {/each}
            </div>
        {/if}

        {#if currQuestionData?.images?.length}
            <p class="text-lg font-medium mt-4 mb-2">Images</p>

            <center class="mb-4">
                <div
                    class="flex justify-center flex-row max-w-full overflow-x-auto h-60"
                >
                    {#each currQuestionData.images as i}
                        <img
                            class="mr-2 ml-2 rounded-lg shrink-0 object-contain"
                            src={i}
                            alt="Question Image"
                        />
                    {/each}
                </div>
            </center>
        {/if}

        {#if !(teamData.completed_levels || []).includes(currQuestionData?.uid)}
            <div class="w-[90%] md:w-[50%] mb-4">
                <Input id="answer" placeholder="..." type="text" />
            </div>

            <button
                class="btn btn-wide btn-primary"
                disabled={loading}
                on:click={submitAnswer}
            >
                {#if loading}
                    <span class="loading loading-ring text-primary loading-lg"
                    ></span>
                {:else}
                    Submit
                {/if}
            </button>
        {:else}
            <button class="btn btn-wide btn-success">
                <CheckCircleIcon color="#000000" />
            </button>
        {/if}
    </center>
{:else}
    You cannot view this right now.
{/if}

<dialog id="logsModal" class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                ✕
            </button>
        </form>

        {#each logs || [] as log}
            {#if log.type === "correct_answer"}
                <button class="btn btn-ghost">
                    <CheckCircleIcon class="text-success" />
                    {log.entered}
                </button><br />
            {:else}
                <button class="btn btn-ghost">
                    <CircleXIcon class="text-secondary" />
                    {log.entered}
                </button><br />
            {/if}
        {/each}
    </div>
</dialog>
