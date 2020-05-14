import React from 'react';

export interface TableRow<T> {
    data: string[];
    meta: T;
}

export interface TableCustomRender<T> {
    render: (data: TableRow<T>) => JSX.Element;
    index: number;
}

export interface TableProps<T> {
    columns: string[];
    data: TableRow<T>[];
    emptyLabel?: string;
    onRowClick?: (data: T) => void;
    customRenders?: TableCustomRender<T>[];
}

export const Table = <T extends object>(props: TableProps<T>): JSX.Element => {
    const onRowClick = (data: T): void => {
        if (props.onRowClick) {
            props.onRowClick(data);
        }
    };

    const renderCell = (row: TableRow<T>, cell: string, iRow: number, iCol: number): JSX.Element => {
        const customRender = props.customRenders?.find(cr => cr.index === iCol);
        return <td key={`cell-${iRow}-${iCol}`}>{customRender?.render(row) || cell}</td>;
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
                        {props.columns.map((cell, iCol) => renderCell(row, row.data[iCol], iRow, iCol))}
                    </tr>
                )}
                {props.data.length === 0 ? <tr><td colSpan={props.columns.length}>{props.emptyLabel || 'You have no certificates yet !'}</td></tr> : null}
            </tbody>
        </table>
    );
};
