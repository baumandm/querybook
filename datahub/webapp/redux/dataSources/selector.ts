import { createSelector } from 'reselect';
import { IStoreState } from 'redux/store/types';
import { queryEngineByIdEnvSelector } from 'redux/queryEngine/selector';
import { IDataColumn } from 'const/metastore';

const queryMetastoreByIdSelector = (state: IStoreState) =>
    state.dataSources.queryMetastoreById;

export const queryMetastoresSelector = createSelector(
    queryMetastoreByIdSelector,
    queryEngineByIdEnvSelector,
    (queryMetastoreById, queryEngineById) =>
        [
            ...new Set(
                Object.values(queryEngineById)
                    .filter(
                        (engine) =>
                            engine.metastore_id &&
                            engine.metastore_id in queryMetastoreById
                    )
                    .map((engine) => engine.metastore_id)
            ),
        ]
            .map((metastoreId) => queryMetastoreById[metastoreId])
            .sort((m) => m.id)
);

const tableSelector = (state: IStoreState, tableId: number) =>
    state.dataSources.dataTablesById[tableId];
export const fullTableSelector = createSelector(
    tableSelector,
    (state: IStoreState) => state.dataSources.dataSchemasById,
    (state: IStoreState) => state.dataSources.dataColumnsById,
    (tableFromState, dataSchemasById, dataColumnsById) => {
        const schemaFromState = tableFromState
            ? dataSchemasById[tableFromState.schema]
            : null;
        if (!tableFromState || !schemaFromState) {
            return {};
        }

        const tableColumnsFromState: IDataColumn[] = (
            (tableFromState || ({} as any)).column || []
        ).map((id) => dataColumnsById[id]);

        const tableNameFromState =
            tableFromState && schemaFromState
                ? `${schemaFromState.name}.${tableFromState.name}`
                : '';

        return {
            table: tableFromState,
            schema: schemaFromState,
            tableName: tableNameFromState,
            tableColumns: tableColumnsFromState,
        };
    }
);
