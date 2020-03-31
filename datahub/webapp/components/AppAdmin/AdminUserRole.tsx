import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ds from 'lib/datasource';
import { getEnumEntries } from 'lib/typescript';
import { getQueryString } from 'lib/utils/query-string';
import { useDataFetch } from 'hooks/useDataFetch';
import { UserRoleType } from 'const/userRoles';

import { IStoreState } from 'redux/store/types';
import * as userActions from 'redux/user/action';

import { UserBadge } from 'components/UserBadge/UserBadge';
import { UserSelect } from 'components/UserSelect/UserSelect';

import { AsyncButton } from 'ui/AsyncButton/AsyncButton';
import { Button } from 'ui/Button/Button';
import { Card } from 'ui/Card/Card';
import { FormField } from 'ui/Form/FormField';
import { Icon } from 'ui/Icon/Icon';
import { Select, makeSelectOptions } from 'ui/Select/Select';

import './AdminUserRole.scss';

interface IAdminUserRole {
    id: number;
    uid: number;
    role: number;
}

export const AdminUserRole: React.FunctionComponent = () => {
    // const [userRoles, setUserRoles] = React.useState<IAdminUserRole[]>([]);
    const [displayNewForm, setDisplayNewForm] = React.useState<boolean>(
        () => getQueryString()['new'] === 'true'
    );
    const [newUserRoleState, setNewUserRoleState] = React.useState({
        uid: null,
        role: null,
    });

    const {
        data: userRoles,
        forceFetch: loadUserRoles,
    }: { data: IAdminUserRole[]; forceFetch } = useDataFetch({
        url: '/admin/user_role/',
    });

    const uid = useSelector((state: IStoreState) => state.user.myUserInfo.uid);

    const dispatch = useDispatch();
    const loginUser = React.useCallback(
        () => dispatch(userActions.loginUser()),
        []
    );

    const deleteUserRole = React.useCallback(async (userRoleId: number) => {
        await ds.delete(`/admin/user_role/${userRoleId}/`);
        await loadUserRoles();
    }, []);

    const createUserRole = React.useCallback(async () => {
        setDisplayNewForm(false);
        await ds.save(`/admin/user_role/`, {
            uid: newUserRoleState.uid,
            role: newUserRoleState.role,
        });
        if (newUserRoleState.uid === uid) {
            loginUser();
        }
        await loadUserRoles();
    }, [newUserRoleState, uid]);

    // TODO: make it work for multiple roles per user
    const cardDOM = userRoles?.map((userRole) => {
        return (
            <Card
                key={userRole.id}
                title={<UserBadge uid={userRole.uid} />}
                width="100%"
                flexRow
            >
                <div className="AdminUserRole-card-roles flex-column">
                    <div className="AdminUserRole-card-role">
                        <div>{UserRoleType[userRole.role]}</div>
                        <Button
                            type="inlineText"
                            borderless
                            title="Remove Role"
                            onClick={() => deleteUserRole(userRole.id)}
                        />
                    </div>
                </div>
            </Card>
        );
    });

    return (
        <div className="AdminUserRole">
            <div className="AdminLanding-top">
                <div className="AdminLanding-title">User Roles</div>
                <div className="AdminLanding-desc">
                    Assign roles to users for access control.
                </div>
            </div>
            <div className="AdminUserRole-content">
                <div className="AdminUserRole-new">
                    {displayNewForm ? (
                        <div className="AdminUserRole-new-form horizontal-space-between">
                            <FormField stacked label="Username">
                                <UserSelect
                                    onSelect={(selectedUid) => {
                                        setNewUserRoleState({
                                            ...newUserRoleState,
                                            uid: selectedUid,
                                        });
                                    }}
                                />
                            </FormField>
                            <FormField stacked label="Role">
                                <Select
                                    value={newUserRoleState?.role}
                                    onChange={(event) => {
                                        const value = event.target.value
                                            ? event.target.value
                                            : null;
                                        setNewUserRoleState({
                                            ...newUserRoleState,
                                            role: value,
                                        });
                                    }}
                                    withDeselect
                                >
                                    {makeSelectOptions(
                                        getEnumEntries(UserRoleType).map(
                                            ([name]) => name
                                        )
                                    )}
                                </Select>
                            </FormField>
                            <div className="AdminUserRole-new-button flex-row">
                                <Button
                                    title="Cancel"
                                    onClick={() => {
                                        setNewUserRoleState(null);
                                        setDisplayNewForm(false);
                                    }}
                                />
                                <AsyncButton
                                    title="Save"
                                    onClick={createUserRole}
                                    disabled={
                                        !newUserRoleState.uid ||
                                        !newUserRoleState.role
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <Card
                            title=""
                            width="100%"
                            flexRow
                            onClick={() => {
                                setNewUserRoleState({
                                    uid: null,
                                    role: null,
                                });
                                setDisplayNewForm(true);
                            }}
                        >
                            <div className="AdminUserRole-new-msg flex-row">
                                <Icon name="plus" />
                                <span>create a new user role</span>
                            </div>
                        </Card>
                    )}
                </div>
                <div className="AdminUserRole-roles flex-column">{cardDOM}</div>
            </div>
        </div>
    );
};
