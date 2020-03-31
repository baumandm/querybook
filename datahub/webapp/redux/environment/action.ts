import ds from 'lib/datasource';

import { arrayGroupByField } from 'lib/utils';
import { ThunkResult, ISetEnvironmentByIdAction } from './types';

export function fetchEnvironments(): ThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const userInfo = getState().user.myUserInfo;

        const {
            data: [visibleEnvironments, userEnvironmentIds],
        } = await ds.fetch(`/user/${userInfo.uid}/environment/`);

        dispatch({
            type: '@@environment/RECEIVE_ENVIRONMENTS',
            payload: {
                environmentById: arrayGroupByField(visibleEnvironments),
            },
        });

        dispatch({
            type: '@@environment/RECEIVE_USER_ENVIRONMENT_IDS',
            payload: {
                userEnvironmentIds,
            },
        });
    };
}

export function setEnvironment(name: string): ThunkResult<any> {
    return (dispatch, getState) => {
        const state = getState().environment;
        let id: number;
        for (const environment of Object.values(state.environmentById)) {
            if (
                environment.name === name &&
                state.userEnvironmentIds.has(environment.id)
            ) {
                id = environment.id;
                break;
            }
        }

        if (id != null) {
            dispatch({
                type: '@@environment/SET_ENVIRONMENT_BY_ID',
                payload: {
                    id,
                },
            });
        } else {
            console.error(`Setting invalid environment ${name}`);
        }
    };
}
