import { format } from 'date-fns';

export const formatDate = (date: string | Date): string => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return date as string;
    }

    return format(d, 'MMM d, yyyy - HH:mm:ss');
};


export const isDateObj = (date: string | Date): boolean => !Number.isNaN(new Date(date).getTime());
