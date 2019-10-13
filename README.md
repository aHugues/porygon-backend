# Backend REST API #

[![Build Status](https://travis-ci.org/aHugues/porygon-backend.svg?branch=master)](https://travis-ci.org/aHugues/porygon-backend)
[![codecov](https://codecov.io/gh/aHugues/porygon-backend/branch/master/graph/badge.svg)](https://codecov.io/gh/aHugues/porygon-backend)

REST API Using Express to link the Porygon application to a SQL database with authentication using 
a Keycloak server.

## Installation ##

### Prerequesites ###

You need **Node.JS** (version 8 or later) and **MySQL** to install the application.


### Installation Procedure ###

#### Creating the database to be accessed ####

This procedure is the same for every operating system.

In the **MySQL Shell**, create a new database `CREATE DATABASE your_database_name;`.

Create a new user to access it `GRANT ALL PRIVILEGES ON your_database_name.* TO your_user IDENTIFIED BY your_password;`

This last command is not necessary as you can use the **root** account, but it is not advisable.

You need to create a config file in `./config/` containing the credentials for the database. It should have the corresponding structure:

```json
database.config.json
---

{
    "production": {
        "client": "mysql",
        "driver": "mysql",
        "password": "<your_password>", 
        "host": "<host>",
        "database": "<your_database_name>",
        "user": "<your_user>"
    }
}
```

Run the migrations: 

```shell
db-migrate --config config/database.config.json -e production up
```

Or for a dev environment, replace `production` by `development` and run 

```shell
db-migrate --config config/database.config.json up
```

### Configure the authentication

The application uses Keycloak for IAM and authentication. To link to your server, 
download the JSON OpenID file and put it into the config folder: 

>Note: This step is not required if running in a development environment as authentication
is automatically bypassed. 

```json
keycloak.config.json
---

{
    "realm": "<realm_name>",
    "realm-public-key": "<realm_public_key",
    "auth-server-url": "keycloak_url",
    "ssl-required": "<ssl_required>",
    "resource": "<client_id>",
    "verify-token-audience": <token_audience_verified>,
    "credentials": {
      "secret": "<secret_key>"
    },
    "use-resource-role-mappings": <use_resource_role_mappings>,
    "confidential-port": <confidential_port>,
    "policy-enforcer": {}
}
```

Update the session secret key: 

```shell
openssl rand -base64 32
```

Replace the `secretKey` field in the `./config/server.config.json` file. 


#### Installing the application ####

Go to the root folder and install the application `npm install`

## Usage ##

### Running the application

Launch the application with `npm start`.

The functions are accessible with `http://your_host:4000/api/v1...`. Of course the port can be adjusted using `./config/server.config.json` to use what you need.

### Deployment to production

The environment can be set using `NODE_ENV=production npm start`. However, it is 
advised to use a proper process manager when running in production, such as `pm2`. 


### Docker

A Docker container is available at `ahugues/porygon-backend`. It uses a volume called `/config` to 
set the database and optionnal keycloak config files. 

If necessary to access the database, the host networking can be used with the flag `--network="host"`.

Launch the Docker container using:

```shell
docker run --network="host" -e NODE_ENV=production -v "$(pwd)/config":/config ahugues/porygon-backend
```