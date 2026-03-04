<script lang="ts">
    import { enhance } from "$app/forms";
    import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { invalidateAll } from "$app/navigation";
    import { IconBrandGoogle } from "@tabler/icons-svelte";

    export let data;
    export let form;

    let isAuthLoading = false;

    async function signInWithGoogle() {
        isAuthLoading = true;
        try {
            const provider = new GoogleAuthProvider();
            const credential = await signInWithPopup(auth, provider);
            const idToken = await credential.user.getIdToken();
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });
            window.location.href = "/admin/login";
        } catch (error) {
            console.error("Google login failed:", error);
        } finally {
            isAuthLoading = false;
        }
    }
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
                <p class="text-base-content/60 mt-1 text-sm">
                    CipherSaga Control Panel
                </p>
            </div>

            {#if !data.isLoggedIn}
                <!-- User is completely logged out of Google -->
                <p class="text-center text-sm font-medium mb-2">
                    You must sign in with an authorized Google account first.
                </p>
                <button
                    class="btn btn-outline w-full mb-2"
                    disabled={isAuthLoading}
                    on:click={signInWithGoogle}
                >
                    {#if isAuthLoading}
                        <span class="loading loading-spinner"></span>
                    {:else}
                        <IconBrandGoogle class="w-5 h-5 mr-2" /> Sign in with Google
                    {/if}
                </button>
                <div class="divider text-xs text-base-content/40">or</div>
                <a class="btn btn-ghost btn-sm w-full" href="/">← Go Home</a>
            {:else if !data.isAdminEmail}
                <!-- Logged in, but not an admin email -->
                <div class="alert alert-error">
                    <span
                        >⛔ Access Denied. Your Google account is not authorised
                        as an admin.</span
                    >
                </div>
                <a class="btn btn-outline btn-sm" href="/">← Go Home</a>
            {:else}
                <!-- Admin email: show password form -->
                {#if form?.error}
                    <div class="alert alert-error text-sm">
                        <span>{form.error}</span>
                    </div>
                {/if}

                <form method="POST" use:enhance class="flex flex-col gap-3">
                    <div class="form-control">
                        <label class="label" for="password">
                            <span class="label-text font-medium"
                                >Admin Password</span
                            >
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
