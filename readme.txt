Only the first time:
npm install knex
npx knex init
npm install pg
npx knex migrate:make init

First run:
npx knex migrate:latest  (command line must be in DBB/sql)
npx knex seed:run 

//Backup sql
pg_dump -h <hostname> -U <username> -d <database_name> -F c -f <backup_file_name>