export const extractProperties = <T extends object, P extends keyof T & string>(obj: T, properties: P[]): { [key in P]: string } => {
    return properties.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {} as { [key in P]: string });
};