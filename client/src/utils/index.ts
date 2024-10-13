import { Comment } from '@/types';

export const formatNumber = (number: number) => {
    if (number < 1000) {
        return number.toString();
    } else if (number < 1000000) {
        return (number / 1000).toFixed(1) + 'K';
    } else {
        return (number / 1000000).toFixed(1) + 'M';
    }
};
export const resizeImage = (img: HTMLImageElement, maxWidth = 860, maxHeight = 860): HTMLCanvasElement => {
    let width = img.width;
    let height = img.height;
    const minWidth = 400;
    const minHeight = 400;

    if (width < minWidth && height < minHeight) {
        const ratioX = minWidth / width;
        const ratioY = minHeight / height;
        const ratio = Math.max(ratioX, ratioY);
        width *= ratio;
        height *= ratio;
    } else {
        const ratioX = maxWidth / width;
        const ratioY = maxHeight / height;
        const ratio = Math.min(ratioX, ratioY);
        width *= ratio;
        height *= ratio;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(img, 0, 0, width, height);
        return canvas;
    } else {
        throw new Error('Failed to get canvas context');
    }
};

export const applyFilters = (imgUrl: string, filters: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const filterString = `brightness(${filters.brightness / 100 + 0.5}) contrast(${
            filters.contrast / 100 + 0.5
        }) saturate(${filters.saturate}%) hue-rotate(${(filters.hue_rotate - 50) * 3.6}deg) sepia(${filters.sepia}%)`;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const img = new Image();
            img.src = imgUrl;
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.filter = filterString;
                ctx.drawImage(img, 0, 0);

                const filteredImgUrl = canvas.toDataURL();
                resolve(filteredImgUrl);
            };
            img.onerror = function (error) {
                reject(error);
            };
        } else {
            reject(new Error('Canvas context is not supported'));
        }
    });
};

export const timeAgoFromPast = (pastTime: Date) => {
    var currentTime = new Date();
    var timeDifference = currentTime.getTime() - pastTime.getTime();

    var secondsAgo = Math.floor(timeDifference / 1000);
    var minutesAgo = Math.floor(secondsAgo / 60);
    var hoursAgo = Math.floor(minutesAgo / 60);
    var daysAgo = Math.floor(hoursAgo / 24);
    var monthsAgo = Math.floor(daysAgo / 30);
    var yearsAgo = Math.floor(monthsAgo / 12);

    // return yearsAgo + ' year' + (yearsAgo > 1 ? 's' : '') + ' ago';

    if (yearsAgo > 0) {
        return yearsAgo + ' year' + (yearsAgo > 1 ? 's' : '');
    } else if (monthsAgo > 0) {
        return monthsAgo + ' month' + (monthsAgo > 1 ? 's' : '');
    } else if (daysAgo > 0) {
        return daysAgo + ' day' + (daysAgo > 1 ? 's' : '');
    } else if (hoursAgo > 0) {
        return hoursAgo + ' hour' + (hoursAgo > 1 ? 's' : '');
    } else if (minutesAgo > 0) {
        return minutesAgo + ' min' + (minutesAgo > 1 ? 's' : '');
    } else {
        return secondsAgo + ' second' + (secondsAgo > 1 ? 's' : '');
    }
};

export const countComments = (comments: Comment[]) => {
    let count = 0;
    comments.forEach((comment) => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
            count += countComments(comment.replies);
        }
    });
    return count;
};

export function formatDateTime(dateTime: Date) {
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - dateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } else if (diffDays <= 365) {
        const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = dateTime.getDate().toString().padStart(2, '0');
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        return `${day}/${month} ${hours}:${minutes}`;
    } else {
        const year = dateTime.getFullYear();
        const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = dateTime.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
}
