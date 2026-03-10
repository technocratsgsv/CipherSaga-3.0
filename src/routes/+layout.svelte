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
        <div class="navbar bg-base-100/50 backdrop-blur-md sticky top-0 z-50">
            <div class="navbar-start">
                <div class="dropdown">
                    <div
                        tabindex="0"
                        role="button"
                        class="btn btn-ghost lg:hidden"
                    >
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
                        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-lg"
                    >
                        <li>
                            <a
                                class:text-primary={$page.url.pathname === "/"}
                                href="/">Home</a
                            >
                        </li>
                        <li>
                            <a
                                class:text-primary={$page.url.pathname ===
                                    "/leaderboard"}
                                href="/leaderboard">Leaderboard</a
                            >
                        </li>
                        {#if ![undefined, null].includes(data.userTeam)}
                            <li>
                                <a
                                    class:text-primary={$page.url.pathname ===
                                        "/team"}
                                    href="/team">Team</a
                                >
                            </li>
                        {/if}
                        {#if data.banned === false && ![undefined, null].includes(data.userTeam)}
                            <li>
                                <a
                                    class:text-primary={$page.url.pathname ===
                                        "/bonus"}
                                    href="/bonus">Bonus</a
                                >
                            </li>
                            <li><a href="/play">Play</a></li>
                        {/if}
                        {#if data.isAdminEmail}
                            <li>
                                <a
                                    class="text-cyan-400 font-semibold"
                                    href="/admin">👑 Admin</a
                                >
                            </li>
                        {/if}
                    </ul>
                </div>
            </div>
            <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1 text-md gap-2">
                    <li>
                        <a
                            class="btn btn-ghost text-md font-normal"
                            class:text-primary={$page.url.pathname === "/"}
                            href="/"><ArrowUpRight /> Home</a
                        >
                    </li>
                    <li>
                        <a
                            class="btn btn-ghost text-md font-normal"
                            class:text-primary={$page.url.pathname ===
                                "/leaderboard"}
                            href="/leaderboard"><ArrowUpRight /> Leaderboard</a
                        >
                    </li>
                    {#if ![undefined, null].includes(data.userTeam)}
                        <li>
                            <a
                                class="btn btn-ghost text-md font-normal"
                                class:text-primary={$page.url.pathname ===
                                    "/team"}
                                href="/team"><ArrowUpRight /> Team</a
                            >
                        </li>
                    {/if}
                    {#if data.banned === false && ![undefined, null].includes(data.userTeam)}
                        <li>
                            <a
                                class="btn btn-ghost text-md font-normal"
                                class:text-primary={$page.url.pathname ===
                                    "/bonus"}
                                href="/bonus"><Disc /> Bonus</a
                            >
                        </li>
                        <li>
                            <a
                                class="btn btn-ghost text-md font-normal"
                                href="/play"><Disc /> Play</a
                            >
                        </li>
                    {/if}
                    {#if data.isAdminEmail}
                        <li>
                            <a
                                class="btn btn-ghost text-md font-normal text-cyan-400"
                                href="/admin"><Disc /> Admin</a
                            >
                        </li>
                    {/if}
                </ul>
            </div>
            <div class="navbar-end"></div>
        </div>
    {/if}
    {#if ["/ready"].includes($page.url.pathname)}
        <div class="navbar bg-base-100/50 backdrop-blur-md sticky top-0 z-50">
            <a
                class="btn btn-ghost text-md"
                class:text-primary={$page.url.pathname === "/"}
                href="/"><ArrowUpRight /> Home</a
            >
        </div>
    {/if}
    <slot />
</FirebaseApp>
