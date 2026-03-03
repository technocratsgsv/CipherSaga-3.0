import { toasts } from "svelte-toasts";

export const sendErrorToast = (title: string, message: string) => {
    const toast = toasts.add({
        title,
        description: message,
        duration: 5000,
        type: 'error',
        theme: 'dark',
    });
}

export const sendSuccessToast = (title: string, message: string) => {
    const toast = toasts.add({
        title,
        description: message,
        duration: 5000,
        type: 'success',
        theme: 'dark',
    });
}

export const sendInfoToast = (title: string, message: string) => {
    const toast = toasts.add({
        title,
        description: message,
        duration: 5000,
        type: 'info',
        theme: 'dark',
    });
}
