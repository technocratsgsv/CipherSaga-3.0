<script>
    import { invalidateAll } from "$app/navigation";
    import { sendSuccessToast, sendErrorToast } from "$lib/toast_utils";

    export let data;
    import { Button } from "@/components/ui/MovingBorder";
    import { Hammer } from "lucide-svelte";
    let clicked = false;
    let loading = false;
    async function leaveTeam() {
        loading = true;
        const r = await fetch("/api/team/leave", {
            method: "POST",
        });
        if (r.ok) {
            sendSuccessToast("Successfully Left", "");
        } else {
            sendErrorToast("Failed to Leave", "");
        }
        await invalidateAll();
        loading = false;
    }
</script>

<title>Cipher Saga 3.0 - Your Team</title>

<h2
    class="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text py-4 text-center text-3xl font-medium tracking-tight text-transparent"
>
    Your team
</h2>

{#if data.teamInfo}
    <center>
        <p
            class="relative z-10 bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-center font-sans text-4xl md:text-6xl font-bold text-transparent pb-[1vh]"
        >
            {data.teamInfo.teamName}
        </p>
        <Button
            borderRadius="0.75rem"
            className="bg-white-300 text-white border-slate-800 text-lg font-medium font-mono"
            onClick={() => {
                navigator.clipboard.writeText(data.teamInfo.code);
                clicked = true;
                setTimeout(() => {
                    clicked = false;
                }, 2000);
            }}
        >
            {#if clicked}
                Copied!
            {:else}{data.teamInfo.code}{/if}
        </Button>
    </center>
    <center>
        <p class="text-lg mt-4 font-medium text-primary font-sans">
            Level {data.teamInfo.level} • Members {data.teamInfo.members
                .length}/3
        </p>
    </center>
    <center>
        <div class="w-[50%]">
            <div class="overflow-x-auto">
                {#each data.teamInfo.members as member}
                    <p class="mt-2 font-medium text-xl">
                        {member.username}
                        {#if data.teamInfo.owner === member.id}👑{/if}
                    </p>
                {/each}
            </div>
        </div>

        {#if !data.teamInfo.banned}
            <button
                class="btn btn-wide mt-10 btn-outline btn-primary"
                disabled={loading}
                on:click={leaveTeam}>Leave team</button
            >
        {:else}
            <button class="text-xl mt-4 font-bold btn btn-ghost text-primary">
                <Hammer /> Your team was banned by an admin</button
            >
        {/if}
    </center>
{/if}
