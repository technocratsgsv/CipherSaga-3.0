<script lang="ts">
    import "../app.css";
    import { ToastContainer, BootstrapToast } from "svelte-toasts";
    import { auth, db, storage } from "$lib/firebase";
    import { FirebaseApp } from "sveltefire";
    import { ArrowUpRight, Disc } from "lucide-svelte";
    import { page } from "$app/stores";
    export let data;
</script>

<FirebaseApp {auth} firestore={db} {storage}>
    <ToastContainer let:data>
        <BootstrapToast {data} />
    </ToastContainer>
    {#if ["/", "/leaderboard", "/team", "/bonus"].includes($page.url.pathname)}
        <div class="navbar">
            <a
                class="btn btn-ghost text-md"
                class:text-primary={$page.url.pathname === "/"}
                href="/"><ArrowUpRight /> Home</a
            >
            <a
                class="btn btn-ghost text-md"
                class:text-primary={$page.url.pathname === "/leaderboard"}
                href="/leaderboard"><ArrowUpRight /> Leaderboard</a
            >
            {#if ![undefined, null].includes(data.userTeam)}<a
                    class="btn btn-ghost text-md"
                    class:text-primary={$page.url.pathname === "/team"}
                    href="/team"><ArrowUpRight /> Team</a
                >{/if}
            {#if data.banned === false && ![undefined, null].includes(data.userTeam)}
                <a
                    class="btn btn-ghost text-md"
                    class:text-primary={$page.url.pathname === "/bonus"}
                    href="/bonus"><Disc /> Bonus</a
                >
                <a class="btn btn-ghost text-md" href="/play"><Disc /> Play</a>
            {/if}
        </div>
    {/if}
    {#if ["/ready"].includes($page.url.pathname)}
        <div class="navbar z-1000">
            <a
                class="btn btn-ghost text-md"
                class:text-primary={$page.url.pathname === "/"}
                href="/"><ArrowUpRight /> Home</a
            >
        </div>
    {/if}
    <slot />

    {#if data.isAdminEmail && !$page.url.pathname.startsWith("/admin")}
        <a
            href="/admin"
            class="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/90 border border-zinc-700 text-cyan-400 text-sm font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:border-cyan-500 hover:text-cyan-300 transition-all duration-300 backdrop-blur-md"
        >
            👑 Admin Panel
        </a>
    {/if}
</FirebaseApp>
