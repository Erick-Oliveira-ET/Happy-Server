# Happy-Server

## Initialization
* `npm init`
* `npm install express`
* `npm install typescript -d`
* `npx tsc --init`
* Changed the target at the tsconfig.json file from es5 to es2017 to reduce unnecessary convertions.
* `npm install ts-node-dev -d` Is used to allow the use of typescript and node.
* Added the dev script. Flags used:
    * Transpile-only: disable the constant auto check made by ts-node-dev.
    * Ignore-watch node_modules:  disable the constant auto check made in the node modules.

* ` npm install typeorm sqlite3`

## Tsconfig:
* Set the "strictPropertyInitialization" to false for ts to not request a initial value as a initialization (this is important when making models).
* Set "experimentalDecorators" and "emitDecoratorMetadata" to true to alow using decorators (also important when making models);

# Database, ORM and typeorm
* Created an ormconfig.json

## ORM
In the ormconfig.json, it is set:
    * Where the database is;
    * The type of the database;
    * Where the migrations will be stored;
    * Where the cli should store the migrations;
    * Where the entites (models) are;

## Typeorm
Typeorm runs in javascript by default. So, it's necessary to overwrite the default script on the package.json.

### Migrations
* Create a migration:
`npx typeorm migration:create -n (name_of_the_migration)`
* Run migrations:
`npm run typeorm migration:run`
* Revert migrations:
`npm run typeorm migration:revert`

## Multer and @types/multer
It's a middleware used to handle image and files sent to the body. (I have a long and painfull history with this middleware). 

# Exception error handler and express-async-errors
This module is used to handle async errors. Async errors usually take too long or sometimes doesn't return anything until a timeout happens.  

# Validation: yup and @types/yup
This module helps to simplify the validation of data.

# Cors
Allow sites with diferents urls to access the server. It's recomended to install as dependency in production because node just allow the trasnfer of data when the the server and frontend are in the same url.