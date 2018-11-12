# postgREST Client & Auth provider for react-admin

Use the `postgrestClient` and `postgrestAuthenticator` modules to convert [react-admin](https://github.com/marmelab/react-admin)'s REST dialect into one compatible with [postgREST](https://github.com/begriffs/postgrest). Refreshes JWT auth tokens a configurable number of seconds before expiry, until logout.

## Installation

```sh
npm install aor-postgrest-client --save
```

## Usage

See the example in `App.js.example`

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import { List, Datagrid, TextField, NumberField } from 'react-admin';

import { ShowButton, EditButton, Edit, SimpleForm, DisabledInput, TextInput, NumberInput } from 'react-admin';
import { Create} from 'react-admin';
import { Show, SimpleShowLayout } from 'react-admin';

import { postgrestClient, postgrestAuthenticator } from 'react-admin-postgrest-client';

const dataProvider = postgrestClient( '/rest', httpClient );

const authProvider = postgrestAuthenticator.createAuthProvider( '/rest/rpc/login' );
const authRefreshSaga = postgrestAuthenticator.createAuthRefreshSaga( '/rest/rpc/refresh_token', 10 ); // seconds before expiry due

const BookList = (props) => (
    <List {...props}>
        <Datagrid>
            <ShowButton />
            <EditButton />
            <TextField source="author" />
            <NumberField source="count" />
        </Datagrid>
    </List>
);
export const BookShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="author" />
            <NumberField source="count" />
        </SimpleShowLayout>
    </Show>
);
export const BookEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <TextInput source="author" />
            <NumberInput source="count" />
        </SimpleForm>
    </Edit>
);
export const BookCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="author" />
            <NumberInput source="count" />
        </SimpleForm>
    </Create>
);
const App = () => (
	<Admin dataProvider={dataProvider} customSagas={[authRefreshSaga]} authProvider={authProvider} >
        <Resource name="books" show={BookShow} create={BookCreate} edit={BookEdit} list={BookList} />
    </Admin>
);

export default App;
```

## TODO

Find a way to kick off refresh token timer after hard reload.

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [tomberek](https://tomberek.info).
