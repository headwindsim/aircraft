Include.addScript("/JS/dataStorage.js");

// TODO use the ts version in src/shared
class NXDataStore {
    /* private */ static get listener() {
        if (NXDataStore._listener === undefined) {
            NXDataStore._listener = RegisterViewListener('JS_LISTENER_SIMVARS', null, true);
        }
        return NXDataStore._listener;
    }

    static get(key, defaultVal) {
        const val = GetStoredData(`A339X_${key}`);
        if (!val) {
            return defaultVal;
        }
        return val;
    }

    static set(key, val) {
        SetStoredData(`A339X_${key}`, val);
        this.listener.triggerToAllSubscribers('HDW_NXDATASTORE_UPDATE', key, val);
    }

    static subscribe(key, callback) {
        return Coherent.on('HDW_NXDATASTORE_UPDATE', (updatedKey, value) => {
            if (key === '*' || key === updatedKey) {
                callback(updatedKey, value);
            }
        }).clear;
    }

    static getAndSubscribe(key, callback, defaultVal) {
        callback(key, NXDataStore.get(key, defaultVal));
        return NXDataStore.subscribe(key, callback);
    }
}
