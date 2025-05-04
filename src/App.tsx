import React from 'react';
import AppRouter from './routes';
import { AppContextProvider } from './context';
import NotificationWrapper from './components/notifications/NotificationWrapper';

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <NotificationWrapper>
        <AppRouter />
      </NotificationWrapper>
    </AppContextProvider>
  );
};

export default App;
