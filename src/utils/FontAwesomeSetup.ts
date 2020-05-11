import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faCheck, faBuilding, faUser, faTimes, faClock
} from '@fortawesome/free-solid-svg-icons';

export const SetupFontAwesome = (): void => {
    library.add(
        faCheck,
        faBuilding,
        faUser,
        faTimes,
        faClock
    );
};