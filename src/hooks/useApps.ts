import { useEffect, useState } from "react";
import { CustomModel, AppObj } from "../interfaces";
import jsonData from "../data/apps.json";



const HOST = 'HOST';
const API_URL: string = 'https://kuupanda.free.beeceptor.com/apps';

export const useApps = ({ criteria }: { criteria: string }): { data: Array<CustomModel>, loading: boolean } => {
    const [_apps, setApps] = useState<Array<AppObj>>();
    const [data, setData] = useState<Array<CustomModel>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getApps().then((apps: Array<AppObj>) => {
            setApps(apps);
        }).catch((err: Error) => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        const data = groupBy(criteria);
        if (data) setData(data);
    }, [_apps]);
    
    useEffect(() => {
        if (data.length) {
            setLoading(false);
        }
    }, [data]);


    const getApps = (): Promise<Array<AppObj>> =>
        fetch(API_URL)
            .then((data) => {
                if (data.ok) return data.json();

                // if we have error from endpoint we have a local json
                return JSON.parse(JSON.stringify(jsonData))
            });

    const groupBy = (criteria: string) => {
        if (criteria == HOST && _apps) {
            const data: Array<CustomModel> = createCustomModel(_apps);
            return data;
        }
    }

    /**
     * this function has big O(n^2) in algorithm complexity but it's the best way for the app,
     * because it will run one time and future methods will find or manipulate a value with big 0(n)
     * thanks to our CustomModel that has a list with apdex sorted;
     */
    const createCustomModel = (apps: Array<AppObj>) => {
        const data: Array<CustomModel> = [];
        apps?.forEach((app: AppObj, indexApp) => {
            app.host.forEach((host: string) => {
                const index = data.findIndex((el) => el.id == host);
                const updatedApp: AppObj = {
                    ...app,
                    id: app.id ?? `${indexApp}-${new Date().getTime()}`,
                }
                if (index >= 0) {
                    const element = data[index];
                    element.list.push(updatedApp);

                    element.list.sort(function (a: AppObj, b: AppObj) {
                        if (a.apdex < b.apdex) {
                            return 1;
                        }
                        if (a.apdex > b.apdex) {
                            return -1;
                        }
                        return 0;
                    });

                    const customModel: CustomModel = {
                        id: host,
                        name: host,
                        list: [...element.list]
                    }
                    data.splice(index, 1, customModel);
                } else {
                    data.push({
                        id: host,
                        name: host,
                        list: [updatedApp]
                    });
                }
            })
        });
        
        /**
         * Optional: In the ui we are reading just 5 apps so to avoid processing unnecesary data
         * we can optimize the data by choosing the first 5.
         */
        // const optimizedData: Array<CustomModel> = optimizeData(data);
        return data;
    }

    const optimizeData = (data: Array<CustomModel>) => {
        return data.map((element) => {
            return {
                ...element,
                list: element.list.slice(0, 5)
            }
        })
    }

    const getTopAppsByHost = (hostName: string) => {
        const host = data?.find((g) => g.id == hostName);
        if (!host) return console.error('host doesnt exists');
        return host.list.slice(0, 2);
    }

    const addAppToHosts = (app: AppObj) => {
        const { host }: { host: Array<string> } = app;
        const updatedData: Array<CustomModel> = [];
        data?.forEach((value: CustomModel) => {
            if (host.includes(value.id)) {
                const index: number = value.list.findIndex((el) => el.apdex <= app.apdex);
                index == -1 ? value.list.push(app) : value.list.splice(index, 0, app);
            }
            updatedData.push(value);
        })
        setData(updatedData);
    }

    const removeAppFromHosts = (app: AppObj) => {
        const { host }: { host: Array<string> } = app;
        const updatedData: Array<CustomModel> = [];
        data?.forEach((value: CustomModel) => {
            if (host.includes(value.id)) {
                const index: number = value.list.findIndex((el) => el.id == app.id);
                if (index != -1) value.list.splice(index, 1);
            }
            updatedData.push(value);
        })
        setData(updatedData);
    }

    return {
        data,
        loading
    };

}