import React, { FunctionComponent, PropsWithChildren, useEffect, useRef } from 'react';

export interface ModalProps {
    shown: boolean;
    className?: string;
    onClose?: () => void;
}

export const Modal: FunctionComponent<PropsWithChildren<ModalProps>> = (props: PropsWithChildren<ModalProps>): JSX.Element | null => {
    const onKeyUp = (event: React.KeyboardEvent<HTMLDocument>): void => {
        if (event.keyCode === 27) {
            props.shown && props.onClose && props.onClose();
        }
    };

    const modalBackDropRef = useRef(null);

    useEffect(() => {
        window.addEventListener('keyup', onKeyUp.bind(null));
        return (): void => window.removeEventListener('keyup', onKeyUp.bind(null));
    }, [props.shown]);

    if (props.shown) {
        return (
            <>
                <div className="modal" ref={modalBackDropRef} >
                    <div className={`modal-dialog ${props.className ? props.className : ''}`}>
                        {props.children}
                    </div>
                </div>
            </>
        );
    } else {
        return null;
    }
};