import SocketIOManager from 'lib/socketio-manager';
import { IDataDocEditor } from 'const/datadoc';

import { IQueryExecution } from 'redux/queryExecutions/types';

interface IDataDocSocketEventPromise<A = () => any, R = (e) => any> {
    resolve: A;
    reject?: R;
}

export interface IDataDocSocketEvent {
    receiveDataDoc?: IDataDocSocketEventPromise<(rawDataDoc) => any>;
    receiveDataDocEditors?: IDataDocSocketEventPromise<(editors: any[]) => any>;

    updateDataDoc?: IDataDocSocketEventPromise<
        (rawDataDoc, isSameOrigin) => any
    >;

    updateDataCell?: IDataDocSocketEventPromise<
        (rawDataCell, isSameOrigin) => any
    >;
    insertDataCell?: IDataDocSocketEventPromise<
        (index: number, rawDataCell) => any
    >;
    deleteDataCell?: IDataDocSocketEventPromise<(index: number) => any>;
    moveDataCell?: IDataDocSocketEventPromise<
        (fromIndex: number, toIndex: number) => any
    >;

    updateDataDocUsers?: IDataDocSocketEventPromise<
        (
            sidToUid: Record<string, number>,
            sidToCellId: Record<string, number>
        ) => any
    >;
    updateDataDocEditor?: IDataDocSocketEventPromise<
        (
            docId: number,
            uid: number,
            editor: IDataDocEditor | null,
            isSameOrigin: boolean
        ) => any
    >;

    receiveQueryExecution?: IDataDocSocketEventPromise<
        (
            queryExecution: IQueryExecution,
            dataCellId: number,
            isSameOrigin: boolean
        ) => any
    >;

    receiveFocusCell?: IDataDocSocketEventPromise<
        (dataCellId: number, uid: number, isSameOrigin: boolean) => any
    >;

    moveDataDocCursor?: IDataDocSocketEventPromise<
        (sid: string, dataCellId?: number) => any
    >;

    receiveDataDocUser?: IDataDocSocketEventPromise<
        (add: boolean, sid: string, uid: number) => any
    >;
}

export class DataDocSocket {
    private static NAME_SPACE = '/datadoc';

    private activeDataDocId = null;
    private socket: SocketIOClient.Socket = null;
    private socketPromise: Promise<any> = null;

    private promiseMap: IDataDocSocketEvent = {};
    private eventMap: IDataDocSocketEvent = {};

    public getActiveDataDocId() {
        return this.socket && this.activeDataDocId != null
            ? this.activeDataDocId
            : null;
    }

    public getSocketId(): string {
        if (!this.socket) {
            return null;
        }
        return this.socket.id.slice(DataDocSocket.NAME_SPACE.length + 1);
    }

    public addDataDoc = async (
        docId: number,
        eventMap: IDataDocSocketEvent
    ) => {
        if (docId !== this.activeDataDocId && this.activeDataDocId != null) {
            this.removeDataDoc(this.activeDataDocId, false);
        }

        this.activeDataDocId = docId;
        this.eventMap = eventMap;

        await this.setupSocket();
        this.socket.emit('subscribe', docId);

        this.getDataDocEditors(docId);
    };

    public removeDataDoc = (docId: number, removeSocket = true) => {
        if (docId === this.activeDataDocId) {
            // Otherwise its NOOP
            this.activeDataDocId = null;

            if (this.socket) {
                // Leave the socket room
                this.socket.emit('unsubscribe', docId);
            }

            this.promiseMap = {};
            if (removeSocket) {
                // If we are not running any query any more, break off the socketio connection
                SocketIOManager.removeSocket(DataDocSocket.NAME_SPACE);
                this.socket = null;
                this.socketPromise = null;
            }
        }
    };

    public getDataDocEditors = (docId: number) => {
        this.socket.emit('fetch_data_doc_editors', docId);
        return this.makePromise('receiveDataDocEditors');
    };

    public updateDataDoc = (docId: number, fields: Record<string, any>) => {
        this.socket.emit('update_data_doc', docId, fields);
        return this.makePromise('updateDataDoc');
    };

    public updateDataCell = (
        docId: number,
        cellId: number,
        fields: { meta?: {}; context?: string }
    ) => {
        this.socket.emit('update_data_cell', docId, cellId, fields);
        return this.makePromise('updateDataCell');
    };

    public deleteDataCell = (docId: number, index: number) => {
        this.socket.emit('delete_data_cell', docId, index);
        return this.makePromise('deleteDataCell');
    };

    public moveDataDocCell = (
        docId: number,
        fromIndex: number,
        toIndex: number
    ) => {
        this.socket.emit('move_data_cell', docId, fromIndex, toIndex);
        return this.makePromise('moveDataCell');
    };

    public insertDataDocCell = (
        docId: number,
        index: number,
        cellType: string,
        context: string,
        meta: {}
    ) => {
        this.socket.emit(
            'insert_data_cell',
            docId,
            index,
            cellType,
            context,
            meta
        );
        return this.makePromise('insertDataCell');
    };

    public moveDataDocCursor = (docId: number, cellId?: number) => {
        if (this.getActiveDataDocId() != null) {
            this.socket.emit('move_data_doc_cursor', docId, cellId);
            return this.makePromise('moveDataDocCursor');
        }
    };

    private makePromise<T = any>(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.promiseMap[key] = {
                resolve,
                reject,
            };
        });
    }

    private resolveProimseAndEvent(
        key: string,
        originator: string,
        ...args: any[]
    ) {
        const isSameOrigin =
            `${DataDocSocket.NAME_SPACE}#${originator}` === this.socket.id;
        if (key in this.promiseMap) {
            this.promiseMap[key].resolve(...args, isSameOrigin);
            delete this.promiseMap[key];
        }

        if (key in this.eventMap) {
            this.eventMap[key].resolve(...args, isSameOrigin);
        }
    }

    private setupSocket = async () => {
        if (this.socketPromise) {
            await this.socketPromise;
        } else {
            // We need to setup our socket
            this.socketPromise = SocketIOManager.getSocket(
                DataDocSocket.NAME_SPACE
            );

            // Setup socket's connection functions
            this.socket = await this.socketPromise;

            this.socket.on('data_doc', (originator, rawDataDoc) => {
                this.resolveProimseAndEvent(
                    'receiveDataDoc',
                    originator,
                    rawDataDoc
                );
            });

            this.socket.on('data_doc_editors', (originator, editors) => {
                this.resolveProimseAndEvent(
                    'receiveDataDocEditors',
                    originator,
                    editors
                );
            });

            this.socket.on('data_doc_updated', (originator, rawDataDoc) => {
                this.resolveProimseAndEvent(
                    'updateDataDoc',
                    originator,
                    rawDataDoc
                );
            });

            this.socket.on('data_cell_updated', (originator, rawDataCell) => {
                this.resolveProimseAndEvent(
                    'updateDataCell',
                    originator,
                    rawDataCell
                );
            });

            this.socket.on('data_cell_deleted', (originator, index) => {
                this.resolveProimseAndEvent(
                    'deleteDataCell',
                    originator,
                    index
                );
            });

            this.socket.on(
                'data_cell_inserted',
                (originator, index, rawDataCell) => {
                    this.resolveProimseAndEvent(
                        'insertDataCell',
                        originator,
                        index,
                        rawDataCell
                    );
                }
            );

            this.socket.on(
                'data_cell_moved',
                (originator, fromIndex, toIndex) => {
                    this.resolveProimseAndEvent(
                        'moveDataCell',
                        originator,
                        fromIndex,
                        toIndex
                    );
                }
            );

            this.socket.on(
                'data_doc_sessions',
                ({
                    users: sidToUid,
                    cursors: sidToCellId,
                }: {
                    users: Record<string, number>;
                    cursors: Record<string, number>;
                }) =>
                    this.resolveProimseAndEvent(
                        'updateDataDocUsers',
                        '',
                        sidToUid,
                        sidToCellId
                    )
            );

            this.socket.on(
                'data_doc_editor',
                (originator, docId, uid, editor) => {
                    this.resolveProimseAndEvent(
                        'updateDataDocEditor',
                        originator,
                        docId,
                        uid,
                        editor
                    );
                }
            );

            this.socket.on(
                'data_doc_query_execution',
                (originator, rawQueryExecution, dataCellId) =>
                    this.resolveProimseAndEvent(
                        'receiveQueryExecution',
                        originator,
                        rawQueryExecution,
                        dataCellId
                    )
            );

            this.socket.on('data_doc_cursor_moved', (originator, cellId) =>
                this.resolveProimseAndEvent(
                    'moveDataDocCursor',
                    originator,
                    originator,
                    cellId
                )
            );

            this.socket.on(
                'data_doc_user',
                (add: boolean, sid: string, uid: number) =>
                    this.resolveProimseAndEvent(
                        'receiveDataDocUser',
                        '',
                        add,
                        sid,
                        uid
                    )
            );

            this.socket.on('error', (e) => {
                console.error(e);
                Object.values(this.promiseMap).map(({ reject }) => reject(e));
            });

            this.socket.on('reconnect', () => {
                // Setup rooms again
                if (this.activeDataDocId != null) {
                    this.socket.emit('subscribe', this.activeDataDocId);
                }
            });
        }
    };
}

const defaultSocket = new DataDocSocket();
export default defaultSocket;
