import { useLocalStorage } from '@instruments/common/persistence';
import { BitFlags } from '@shared/bitFlags';
import { useCallback, useState } from 'react';

export const useBitFlags = (
    name: string,
): [BitFlags, (setter: BitFlags
) => void] => {
    const [storage, setStorage] = useLocalStorage(name, '');
    const [stateValue, setValue] = useState(storage ? JSON.parse(storage) : []);

    const setter = useCallback((value: BitFlags) => {
        const executedValue: number[] = value.toDouble();
        setValue(executedValue);
        setStorage(JSON.stringify(executedValue));
    }, [name, stateValue]);

    return [new BitFlags(stateValue), setter];
};
