import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faCheck
} from '@fortawesome/free-solid-svg-icons';

export const SetupFontAwesome = (): void => {
    library.add(
        faCheck
    );
};