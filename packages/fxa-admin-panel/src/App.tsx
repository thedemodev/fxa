import React, { Suspense } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import EmailBlocks from './components/EmailBlocks';

function App() {
  const routes = (
    <Switch>
      <Redirect exact from="/" to="/email-blocks" />
      <Route path="/email-blocks" component={EmailBlocks} />
    </Switch>
  );

  return (
    <AppLayout>
      <Suspense fallback={<p>Loading...</p>}>{routes}</Suspense>
    </AppLayout>
  );
}

export default App;
