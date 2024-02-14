# Project Name

Ory Identity

## Description

This project includes configurations and code for setting up and running ORY Hydra, ORY Kratos, and a Next.js application with ORY UI.

## Project Structure

- `docker-compose.yml` and `docker-compose-hydra.yml`: Docker Compose files for setting up the services.
- `hydra/`: Contains configuration for ORY Hydra.
- `kratos/`: Contains configuration and identity schema for ORY Kratos.
- `ory-ui-nextjs/`: Contains the Next.js application with ORY UI.

## Setup

### Prerequisites

- Docker
- Node.js

### Installation

1. Clone the repository.
2. Run `docker-compose up -d` in the root directory to start the services.
3. Navigate to `ory-ui-nextjs/` and run `npm install` to install the dependencies for the Next.js application.
4. Run `npm run dev` to start the Next.js application.

## Usage

Describe how to use the application here.

## Contributing

Provide instructions on how to contribute to this project.

## License

Include information about the license here.
