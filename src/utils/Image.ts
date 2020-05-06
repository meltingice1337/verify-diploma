import { toast } from 'react-toastify';

export const imageFileToBase64 = async (file?: File): Promise<string | undefined> => {
    return new Promise((resolve): void => {
        if (file) {
            if (!(/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(file.name)) {
                toast.error('The selected file is not an image.');
                resolve(undefined);
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (): void => resolve(reader.result as string);
        } else {
            resolve(undefined);
        }
    });
};