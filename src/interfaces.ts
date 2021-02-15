export interface AppObj {
    id?: any;
    name: string;
    contributors: Array<string>;
    version: number;
    apdex: number;
    host: Array<string>;
};

export interface CustomModel {
    id: string;
    name: string;
    list: Array<AppObj>;
}