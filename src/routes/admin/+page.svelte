<script lang="ts">
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
    export let data;
    const { stats } = data;
</script>

<svelte:head>
    <title>Admin Dashboard — CipherSaga</title>
</svelte:head>

<div
    class="relative min-h-screen w-full flex-col items-center justify-start antialiased p-8 z-0 overflow-y-auto"
>
    <div class="fixed inset-0 z-[-1]">
        <BackgroundBeams />
    </div>

    <!-- Header -->
    <div
        class="flex items-center justify-between mb-8 relative z-10 max-w-5xl mx-auto"
    >
        <div>
            <h1
                class="text-4xl font-bold bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-transparent pb-1"
            >
                ⚙️ Admin Dashboard
            </h1>
            <p class="text-neutral-400 mt-1">CipherSaga Control Panel</p>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
            <a
                href="/ready"
                class="btn btn-ghost btn-sm text-cyan-400 hover:text-white hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all"
                >🎮 Go to Website</a
            >
            <a
                href="/"
                class="btn btn-ghost btn-sm text-neutral-300 hover:text-white hover:bg-zinc-800"
                >← Home</a
            >
            <a
                href="/api/auth"
                class="btn btn-outline border-red-900/50 text-red-400 hover:bg-red-900/30 hover:border-red-500 btn-sm"
                on:click|preventDefault={async () => {
                    await fetch("/api/auth", { method: "DELETE" });
                    window.location.href = "/";
                }}>Sign Out</a
            >
        </div>
    </div>

    <!-- Stats row -->
    <div
        class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10 relative z-10 max-w-5xl mx-auto"
    >
        <div
            class="stat bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div class="stat-figure text-primary text-3xl">❓</div>
            <div class="stat-title text-neutral-400 text-xs">Questions</div>
            <div class="stat-value text-2xl text-primary">
                {stats.totalQuestions}
            </div>
        </div>
        <div
            class="stat bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div class="stat-figure text-cyan-400 text-3xl">👥</div>
            <div class="stat-title text-neutral-400 text-xs">Teams</div>
            <div class="stat-value text-2xl text-cyan-400">
                {stats.totalTeams}
            </div>
        </div>
        <div
            class="stat bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div class="stat-figure text-red-500 text-3xl">🚫</div>
            <div class="stat-title text-neutral-400 text-xs">Banned</div>
            <div class="stat-value text-2xl text-red-500">
                {stats.bannedTeams}
            </div>
        </div>
        <div
            class="stat bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div class="stat-figure text-amber-400 text-3xl">🎯</div>
            <div class="stat-title text-neutral-400 text-xs">Bonus Qs</div>
            <div class="stat-value text-2xl text-amber-400">
                {stats.totalBonus}
            </div>
        </div>
        <div
            class="stat bg-zinc-950/80 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div class="stat-figure text-emerald-400 text-3xl">✅</div>
            <div class="stat-title text-neutral-400 text-xs">Solved Bonus</div>
            <div class="stat-value text-2xl text-emerald-400">
                {stats.solvedBonus}
            </div>
        </div>
    </div>

    <!-- Nav cards -->
    <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 max-w-5xl mx-auto"
    >
        <a
            href="/admin/questions"
            class="card bg-zinc-950/80 border border-zinc-800 shadow-xl hover:shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:-translate-y-1 hover:border-zinc-600 transition-all duration-300 cursor-pointer backdrop-blur-sm group"
        >
            <div class="card-body">
                <h2
                    class="card-title text-2xl text-neutral-200 group-hover:text-primary transition-colors"
                >
                    📋 Question Management
                </h2>
                <p class="text-neutral-400">
                    Add, edit, or delete main game questions. View answers and
                    manage levels.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span
                        class="btn btn-sm bg-zinc-900 border-zinc-700 text-neutral-300 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all"
                        >Manage →</span
                    >
                </div>
            </div>
        </a>

        <a
            href="/admin/teams"
            class="card bg-zinc-950/80 border border-zinc-800 shadow-xl hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:-translate-y-1 hover:border-zinc-600 transition-all duration-300 cursor-pointer backdrop-blur-sm group"
        >
            <div class="card-body">
                <h2
                    class="card-title text-2xl text-neutral-200 group-hover:text-cyan-400 transition-colors"
                >
                    👥 Team Management
                </h2>
                <p class="text-neutral-400">
                    View all teams, ban/unban teams, or delete teams entirely.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span
                        class="btn btn-sm bg-zinc-900 border-zinc-700 text-neutral-300 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all"
                        >Manage →</span
                    >
                </div>
            </div>
        </a>

        <a
            href="/admin/bonus"
            class="card bg-zinc-950/80 border border-zinc-800 shadow-xl hover:shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:-translate-y-1 hover:border-zinc-600 transition-all duration-300 cursor-pointer backdrop-blur-sm group"
        >
            <div class="card-body">
                <h2
                    class="card-title text-2xl text-neutral-200 group-hover:text-amber-400 transition-colors"
                >
                    🎯 Bonus Question Management
                </h2>
                <p class="text-neutral-400">
                    Add, edit, hide/show bonus questions. See who scanned and
                    solved each one.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span
                        class="btn btn-sm bg-zinc-900 border-zinc-700 text-neutral-300 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all"
                        >Manage →</span
                    >
                </div>
            </div>
        </a>

        <a
            href="/admin/settings"
            class="card bg-zinc-950/80 border border-zinc-800 shadow-xl hover:shadow-[0_0_15px_rgba(167,139,250,0.3)] hover:-translate-y-1 hover:border-zinc-600 transition-all duration-300 cursor-pointer backdrop-blur-sm group"
        >
            <div class="card-body">
                <h2
                    class="card-title text-2xl text-neutral-200 group-hover:text-violet-400 transition-colors"
                >
                    ⚙️ Site Settings
                </h2>
                <p class="text-neutral-400">
                    Control game start/end times and enable maintenance mode for
                    players.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span
                        class="btn btn-sm bg-zinc-900 border-zinc-700 text-neutral-300 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500 transition-all"
                        >Configure →</span
                    >
                </div>
            </div>
        </a>
    </div>
</div>
