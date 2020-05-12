import React from 'react';

import styles from './Spinner.module.scss';

export const Spinner = (): JSX.Element => {
    return (
        <div className={styles.spinnerWrapper}>
            <div className={styles.spinner} />
        </div>
    );
}; 