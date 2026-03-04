<script lang="ts">
    export let data;
    const { stats } = data;
</script>

<svelte:head>
    <title>Admin Dashboard — CipherSaga</title>
</svelte:head>

<div class="min-h-screen bg-base-200 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-4xl font-bold">⚙️ Admin Dashboard</h1>
            <p class="text-base-content/60 mt-1">CipherSaga Control Panel</p>
        </div>
        <div class="flex gap-2">
            <a href="/" class="btn btn-ghost btn-sm">← Back to Site</a>
            <a
                href="/api/auth"
                class="btn btn-outline btn-error btn-sm"
                on:click|preventDefault={async () => {
                    await fetch("/api/auth", { method: "DELETE" });
                    window.location.href = "/";
                }}>Sign Out</a
            >
        </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div class="stat bg-base-100 rounded-2xl shadow">
            <div class="stat-figure text-primary text-3xl">❓</div>
            <div class="stat-title">Total Questions</div>
            <div class="stat-value text-primary">{stats.totalQuestions}</div>
        </div>
        <div class="stat bg-base-100 rounded-2xl shadow">
            <div class="stat-figure text-secondary text-3xl">👥</div>
            <div class="stat-title">Total Teams</div>
            <div class="stat-value text-secondary">{stats.totalTeams}</div>
        </div>
        <div class="stat bg-base-100 rounded-2xl shadow">
            <div class="stat-figure text-error text-3xl">🚫</div>
            <div class="stat-title">Banned Teams</div>
            <div class="stat-value text-error">{stats.bannedTeams}</div>
        </div>
    </div>

    <!-- Nav cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a
            href="/admin/questions"
            class="card bg-base-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
            <div class="card-body">
                <h2 class="card-title text-2xl">📋 Question Management</h2>
                <p class="text-base-content/60">
                    Add, edit, or delete questions. View answers and manage
                    levels.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span class="btn btn-primary btn-sm">Manage →</span>
                </div>
            </div>
        </a>

        <a
            href="/admin/teams"
            class="card bg-base-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
            <div class="card-body">
                <h2 class="card-title text-2xl">👥 Team Management</h2>
                <p class="text-base-content/60">
                    View all teams, ban/unban teams, or delete teams entirely.
                </p>
                <div class="card-actions justify-end mt-2">
                    <span class="btn btn-secondary btn-sm">Manage →</span>
                </div>
            </div>
        </a>
    </div>
</div>
