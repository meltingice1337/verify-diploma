import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faCheck, faBuilding, faUser
} from '@fortawesome/free-solid-svg-icons';

export const SetupFontAwesome = (): void => {
    library.add(
        faCheck,
        faBuilding,
        faUser
    );
};