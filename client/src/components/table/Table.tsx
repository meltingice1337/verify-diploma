import React from 'react';

export interface TableRow<T> {
    data: string[];
    meta: T;
}

export interface TableProps<T> {
    columns: string[];
    data: TableRow<T>[];
    emptyLabel?: string;
    onRowClick?: (data: T) => void;
}

export const Table = <T extends object>(props: TableProps<T>): JSX.Element => {
    const onRowClick = (data: T): void => {
        if (props.onRowClick) {
            props.onRowClick(data);
        }
    };

    return (
        <table className={`table table-bordered ${props.onRowClick ? 'table-hover' : ''}`}>
            <thead>
                <tr>
                    {props.columns.map((col, i) => <th scope="col" key={`col-${i}`}>{col}</th>)}
                </tr>
            </thead>
            <tbody>
                {props.data.map((row, iRow) =>
                    <tr
                        key={`row-${iRow}`}
                        onClick={onRowClick.bind(null, row.meta)}
                        className={props.onRowClick ? 'clickable' : undefined}
                    >
                        {row.data.map((cell, iCell) => <td key={`cell-${iRow}-${iCell}`}>{cell}</td>)}
                    </tr>
                )}
                {props.data.length === 0 ? <tr><td colSpan={props.columns.length}>{props.emptyLabel || 'You have no certificates yet !'}</td></tr> : null}
            </tbody>
        </table>
    );
};