import React from 'react';
import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import { DataDocWrapper } from 'components/DataDoc/DataDocWrapper';

import './AppDataDoc.scss';
import { Landing } from 'components/Landing/Landing';
import { FourOhFour } from 'ui/ErrorPage/FourOhFour';
import { DataDoc } from 'components/DataDoc/DataDoc';

export const AppDataDoc: React.FunctionComponent<RouteComponentProps> = () => {
    return (
        <Switch>
            <Route path="/:env/datadoc/:docId/" component={DataDocWrapper} />
            <Route path="/:env/datadoc/" exact={true} component={Landing} />
            <Route component={FourOhFour} />
        </Switch>
    );
};
