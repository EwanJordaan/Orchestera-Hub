# Job Orchestrator API

This is a job orchestrator API that allows you to create and manage jobs.

## Docker

This project uses Docker to create a reproducible development environment.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Getting Started

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/job-orchestrator-api.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd job-orchestrator-api
    ```

3.  Build and run the application:

    ```bash
    docker-compose up -d --build
    ```

The API will be available at `http://localhost:3000`.

### Database

The application uses a PostgreSQL database. The database is automatically created and configured when you run `docker-compose up`.

You can connect to the database using a database client of your choice. The connection details are:

-   **Host**: `localhost`
-   **Port**: `5432`
-   **Username**: `user`
-   **Password**: `password`
-   **Database**: `mydatabase`

### Stopping the Application

To stop the application, run:

```bash
docker-compose down
```

This will stop and remove the containers, networks, and volumes created by `docker-compose up`.

### Workspace Queues

The workspace queues are managed by the application itself. The `Dockerfile` and `docker-compose.yml` files are configured to run the application in a Docker container. The application will then connect to the database and manage the queues.
