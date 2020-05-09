import { useParams, useLocation, useHistory, useRouteMatch, match as M } from 'react-router';
import * as H from 'history';
import { useMemo } from 'react';

type HistoryPush = (path: H.Path, state?: H.LocationState) => void;
type HistoryReplace = (path: H.Path, state?: H.LocationState) => void;
export interface RouterHook<QT, LS> {
    push: HistoryPush;
    replace: HistoryReplace;
    pathname: string;
    params: QT;
    match: M<{}> | null;
    location: H.Location<LS | null>;
    history: H.History<unknown>;
}
export const useRouter = <QT = {}, LS = {}>(): RouterHook<QT, LS> => {
    const params = useParams<QT>();
    const location = useLocation<LS>();
    const history = useHistory();
    const match = useRouteMatch();

    return useMemo((): RouterHook<QT, LS> => {
        return {
            push: history.push.bind(null),
            replace: history.replace.bind(null),
            pathname: location.pathname,
            params,
            match,
            location,
            history
        };
    }, [params, match, location, history]);
};