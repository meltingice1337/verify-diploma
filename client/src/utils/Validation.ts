export const UrlRegex = /^http(s)?:\/\/(.*?)(\.[a-z]+)?(:[0-9]+)?\/(.*?)$|^$/;
export const isValidUrl = (url: string): boolean => UrlRegex.test(url);

