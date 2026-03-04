<script lang="ts">
    import { enhance } from '$app/forms';
    export let data;
    export let form;
</script>

<svelte:head>
    <title>Admin Login — CipherSaga</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-2xl">
        <div class="card-body gap-4">
            <!-- Logo / title -->
            <div class="text-center mb-2">
                <h1 class="text-3xl font-bold tracking-tight">
                    🔐 Admin Access
                </h1>
                <p class="text-base-content/60 mt-1 text-sm">CipherSaga Control Panel</p>
            </div>

            {#if !data.isAdminEmail}
                <!-- Not an admin email -->
                <div class="alert alert-error">
                    <span>⛔ Access Denied. Your Google account is not authorised as an admin.</span>
                </div>
                <a class="btn btn-outline btn-sm" href="/">← Go Home</a>
            {:else}
                <!-- Password form -->
                {#if form?.error}
                    <div class="alert alert-error text-sm">
                        <span>{form.error}</span>
                    </div>
                {/if}

                <form method="POST" use:enhance class="flex flex-col gap-3">
                    <div class="form-control">
                        <label class="label" for="password">
                            <span class="label-text font-medium">Admin Password</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter admin password"
                            class="input input-bordered w-full"
                            required
                            autofocus
                        />
                    </div>
                    <button type="submit" class="btn btn-primary w-full mt-2">
                        Unlock Admin Panel
                    </button>
                </form>

                <div class="divider text-xs text-base-content/40">or</div>
                <a href="/" class="btn btn-ghost btn-sm">← Back to Home</a>
            {/if}
        </div>
    </div>
</div>
