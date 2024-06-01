# Ory Identity

This project includes configurations and code for setting up and running ORY Hydra, ORY Kratos, and a Next.js application with ORY UI.

## Project Structure

- `docker-compose.yml`: Docker Compose file for setting up the services.
- `hydra/`: Contains configuration for ORY Hydra.
  - `hydra.yml`: Configuration file for ORY Hydra.
- `kratos/`: Contains configuration and identity schema for ORY Kratos.
  - `kratos.yml`: Configuration file for ORY Kratos.
  - `identity.schema.json`: Defines the identity schema for ORY Kratos.
- `ory-ui-nextjs/`: Contains the Next.js application with ORY UI.
  - `.next`: Next.js build directory.
  - `node_modules`: Project dependencies.
  - `public`: Static files for the Next.js app.
  - `src`: Source code for the Next.js app.
  - `Dockerfile`: Dockerfile for building the Next.js app.
  - `next-env.d.ts`: TypeScript environment definitions.
  - `next.config.mjs`: Next.js configuration file.
  - `package.json`: Project metadata and dependencies.
  - `package-lock.json`: Exact versions of dependencies.
  - `postcss.config.js`: PostCSS configuration.
  - `tailwind.config.ts`: Tailwind CSS configuration.
  - `tsconfig.json`: TypeScript configuration file.

## Prerequisites

- Docker
- Node.js

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/ory-identity.git
   cd ory-identity
   ```

2. **Start the services**:

   ```bash
   docker-compose up -d
   ```

3. **Install dependencies for the Next.js application**:

   ```bash
   cd ory-ui-nextjs
   npm install
   ```

4. **Start the Next.js application**:

   ```bash
   npm run dev
   ```

## Usage

1. **Access the Next.js UI**:
   Open your browser and navigate to [http://127.0.0.1:3000](http://127.0.0.1:3000).

2. **Access Kratos and Hydra**:

   - **Kratos Public**: [http://127.0.0.1:4433](http://127.0.0.1:4433)
   - **Kratos Admin**: [http://kratos:4434](http://kratos:4434)
   - **Hydra Public**: [http://127.0.0.1:4444](http://127.0.0.1:4444)
   - **Hydra Admin**: [http://hydra:4445](http://hydra:4445)
   - **MailSlurper**: [http://127.0.0.1:4436](http://127.0.0.1:4436)

3. **Redirect URI Example**:

   ```text
   http://127.0.0.1:4444/oauth2/auth?response_type=code&client_id=758a580d-54e4-4ca3-8b25-3c6b478e9e66&redirect_uri=https://codedash.in&state=1234571625371253716&prompt=registration
   ```

## Configuration Files

### Kratos Configuration (`kratos/kratos.yml`)

This file contains the configuration for Ory Kratos, including self-service flows, SMTP settings, and identity schema.

### Identity Schema (`kratos/identity.schema.json`)

Defines the schema for user identities, including required traits like email and name.

### Hydra Configuration (`hydra/hydra.yml`)

This file contains the configuration for Ory Hydra, including URLs for consent, login, registration, and logout.

## Docker Compose File (`docker-compose.yml`)

The Docker Compose file defines and manages the multi-container Docker application. It includes services for Kratos, Hydra, MailSlurper, and the Next.js frontend.

## Dockerfile for Next.js (`ory-ui-nextjs/Dockerfile`)

This Dockerfile defines the build steps for the Next.js application.

## Development

To start and stop the services during development, use the following commands:

- **Start Services**: `docker-compose up`
- **Stop Services**: `docker-compose down`

To rebuild the services after making changes, run:

```bash
docker-compose up --build
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License.
