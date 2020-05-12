import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './Stepper.module.scss';

interface StepperProps {
    steps: string[];
    activeStep: number;
}

export const Stepper = (props: StepperProps): JSX.Element => {
    const getStepStateClassname = (stepIndex: number): string => {
        if (stepIndex < props.activeStep) {
            return styles.previous;
        } else if (stepIndex === props.activeStep) {
            return styles.active;
        } else {
            return styles.future;
        }
    };

    const renderSteps = (): JSX.Element[] => {
        return props.steps.map((step, i) => (
            <div className={`${styles.step} ${getStepStateClassname(i)}`} key={`step-${i}`}>
                <span className={styles.stepCircle}>{i >= props.activeStep ? i + 1 : <FontAwesomeIcon icon="check" className={styles.icon} />}</span>
                <span className={styles.stepLabel}>{step}</span>
            </div>
        ));
    };

    return (
        <div className={styles.stepContainer}>
            {renderSteps()}
        </div>
    );
};