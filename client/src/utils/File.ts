import { toast } from 'react-toastify';

export const readFile = async (file?: File): Promise<string | undefined> => {
    return new Promise((resolve): void => {
        if (file) {
            if (!(/\.(json)$/i).test(file.name)) {
                toast.error('A valid json file should have the .json extension');
                resolve(undefined);
            }

            const reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = (): void => resolve(reader.result as string);
        } else {
            resolve(undefined);
        }
    });
};