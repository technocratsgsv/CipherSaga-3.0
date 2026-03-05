<script lang="ts">
    import { enhance } from "$app/forms";
    import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { invalidateAll } from "$app/navigation";
    import { IconBrandGoogle } from "@tabler/icons-svelte";
    import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

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

<div
    class="relative flex min-h-screen w-full flex-col items-center justify-center rounded-md px-4 antialiased"
>
    <BackgroundBeams />

    <div
        class="card w-full max-w-md bg-zinc-950/80 border border-zinc-800 shadow-2xl z-10 backdrop-blur-sm"
    >
        <div class="card-body gap-4">
            <!-- Logo / title -->
            <div class="text-center mb-2">
                <h1
                    class="text-3xl font-bold tracking-tight bg-gradient-to-b from-neutral-200 to-primary bg-clip-text text-transparent"
                >
                     Admin Access
                </h1>
                <p class="text-neutral-400 mt-1 text-sm">
                    CipherSaga Control Panel
                </p>
            </div>

            {#if !data.isLoggedIn}
                <!-- User is completely logged out of Google -->
                <p
                    class="text-center text-sm font-medium mb-2 text-neutral-300"
                >
                    You must sign in with an authorized Google account first.
                </p>

                <button
                    class="group/btn relative flex h-10 items-center justify-center space-x-2 rounded-md px-4 font-medium text-black shadow-input bg-zinc-900 shadow-[0px_0px_1px_1px_var(--neutral-800)] w-full mb-2"
                    style="z-index: 1;"
                    disabled={isAuthLoading}
                    on:click={signInWithGoogle}
                >
                    {#if isAuthLoading}
                        <span class="loading loading-spinner text-neutral-300"
                        ></span>
                    {:else}
                        <IconBrandGoogle
                            class="h-5 w-5 mr-2 text-neutral-300"
                        />
                        <span class="text-sm text-neutral-300">
                            Sign in with Google
                        </span>
                        <span
                            class="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"
                        />
                        <span
                            class="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"
                        />
                    {/if}
                </button>
                <div class="divider text-xs text-neutral-500">or</div>
                <a
                    class="btn btn-ghost btn-sm w-full text-neutral-400 hover:text-white hover:bg-zinc-800"
                    href="/">← Go Home</a
                >
            {:else if !data.isAdminEmail}
                <!-- Logged in, but not an admin email -->
                <div
                    class="alert bg-red-950/50 border border-red-900 text-red-200"
                >
                    <span
                        > Access Denied. Your Google account is not authorised
                        as an admin.</span
                    >
                </div>
                <a
                    class="btn btn-outline btn-sm border-zinc-700 text-neutral-300 hover:bg-zinc-800"
                    href="/">← Go Home</a
                >
            {:else}
                <!-- Admin email: show password form -->
                {#if form?.error}
                    <div
                        class="alert bg-red-950/50 border border-red-900 text-red-200 text-sm"
                    >
                        <span>{form.error}</span>
                    </div>
                {/if}

                <form method="POST" use:enhance class="flex flex-col gap-3">
                    <div class="form-control">
                        <label class="label" for="password">
                            <span
                                class="label-text font-medium text-neutral-300"
                                >Admin Password</span
                            >
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter admin password"
                            class="input input-bordered w-full bg-zinc-900 border-zinc-700 text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            required
                            autofocus
                        />
                    </div>

                    <button
                        type="submit"
                        class="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-4 z-10"
                    >
                        Unlock Admin Panel
                        <span
                            class="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100"
                        />
                        <span
                            class="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100"
                        />
                    </button>
                </form>

                <div class="divider text-xs text-neutral-500">or</div>
                <a
                    href="/"
                    class="btn btn-ghost btn-sm text-neutral-400 hover:text-white hover:bg-zinc-800"
                    >← Back to Home</a
                >
            {/if}
        </div>
    </div>
</div>
