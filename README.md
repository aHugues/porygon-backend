# Backend REST API #

This is a RESTful API realised with Express.JS to provide routes for the frontend application to access the data.

Currently it is linked to a MySQL database through Sequelize.

## Installation ##

### Prerequesites ###

You need **Node.JS** (version 6 or later) and **MySQL** to install the application.

There is no OS limitation (although I would advice against using Windows for your sanity...)

### Installation Procedure ###

#### Installing the database ####

Procedure to install the database.

##### MacOS #####

You can use a package manager like brew, but I've always had problem with this version so use the version downloaded on the **MySQL** website and follow the instruction.

##### Linux #####

Use your favourite package manager depending on your distribution, for **Ubuntu**, it would be something like `sudo apt install mysql`

##### Windows #####

Pray.

Or use the installation wizard and hope it works on the first time. Not guaranteed.

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

### Configure the authentication

The application uses Keycloak for IAM and authentication. To link to your server, 
download the JSON OpenID file and put it into the config folder: 

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

Go to your backend folder and install the application `npm install`

## Usage ##

Launch the application with `npm start`.

The functions are accessible with `http://your_host:4000/api/v1...`. Of course the port can be adjusted using `./config/server.config.json` to use what you need.

You can use the provided documentation for notes concerning the server usage.
