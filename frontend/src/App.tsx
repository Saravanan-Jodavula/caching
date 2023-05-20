import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@rtk-incubator/rtk-query/react';
import DataTable from './DataTable';
import config from './config.json';
const type = "Sales";
const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/api/' }), // Replace with your API endpoint
  endpoints: (builder) => ({
    misReports: builder.query<any[], void>({
      query: () => `misReports?report_type=${type}`,
    }),
  }),
});

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

const App: React.FC = () => {
  return (
      <DataTable data={api.endpoints.misReports.useQuery().data ?? []} columns={config.columns} />
  );
};

const AppWrapper: React.FC = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default AppWrapper;
