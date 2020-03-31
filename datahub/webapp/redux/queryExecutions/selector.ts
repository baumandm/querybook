import { createSelector } from 'reselect';
import { IStoreState } from 'redux/store/types';

const queryExecutionIdsSelector = (state: IStoreState, cellId) =>
    cellId in state.queryExecutions.dataCellIdQueryExecution
        ? [...state.queryExecutions.dataCellIdQueryExecution[cellId]]
        : [];

export const queryExecutionByIdSelector = (state: IStoreState) =>
    state.queryExecutions.queryExecutionById;

export const makeQueryExecutionsSelector = () =>
    createSelector(
        queryExecutionIdsSelector,
        queryExecutionByIdSelector,
        (queryExecutionIds, queryExecutionById) =>
            queryExecutionIds
                .sort((a, b) => b - a)
                .map((queryExecutionId) => queryExecutionById[queryExecutionId])
                .filter((q) => q)
    );

export const dataCellIdQueryExecutionSelector = (
    state: IStoreState,
    cellId: number
) => state.queryExecutions.dataCellIdQueryExecution[cellId];

// returns array of query execution ids
export const dataCellIdQueryExecutionArraySelector = createSelector(
    dataCellIdQueryExecutionSelector,
    (dataCellIdQueryExecutionSet) =>
        (dataCellIdQueryExecutionSet &&
            Array.from(dataCellIdQueryExecutionSet).sort((a, b) => b - a)) ||
        undefined
);

export const queryExecutionSelector = (
    state: IStoreState,
    executionId: number
) => state.queryExecutions.queryExecutionById[executionId];

// returns array of query statement ids
export const queryExecutionStatementExecutionSelector = createSelector(
    queryExecutionSelector,
    (queryExecution) =>
        (queryExecution && queryExecution.statement_executions) || undefined
);

export const statementExecutionsSelector = createSelector(
    queryExecutionSelector,
    (state) => state.queryExecutions.statementExecutionById,
    (queryExecution, statementExecutionById) =>
        ((queryExecution || {}).statement_executions || []).map(
            (id) => statementExecutionById[id]
        )
);
