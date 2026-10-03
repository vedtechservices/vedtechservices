Welcome to Your Miaoda Project
Project Info
This project uses Next.js 15 App Router, React, TypeScript, Tailwind CSS, and Supabase.

Project structure
├── app/ # Next.js App Router entry points and layouts
├── public/ # Static assets
├── src/components/ # Shared UI and feature components
├── src/views/ # Existing application views used by the compatibility route table
├── src/routes.tsx # Route-to-view configuration
├── src/lib/next-router.tsx # React Router API compatibility backed by Next.js
├── next.config.ts # Next.js configuration
├── package.json # Scripts and dependencies
└── tsconfig.json # TypeScript configuration

Development Guidelines
How to edit code locally?
You can choose VSCode or any IDE you prefer. The only requirement is to have Node.js and npm installed.

Environment Requirements
# Node.js ≥ 20
# npm ≥ 10
Example:
# node -v   # v20.18.3
# npm -v    # 10.8.2
Installing Node.js on Windows
# Step 1: Visit the Node.js official website: https://nodejs.org/, click download. The website will automatically suggest a suitable version (32-bit or 64-bit) for your system.
# Step 2: Run the installer: Double-click the downloaded installer to run it.
# Step 3: Complete the installation: Follow the installation wizard to complete the process.
# Step 4: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
Installing Node.js on macOS
# Step 1: Using Homebrew (Recommended method): Open Terminal. Type the command `brew install node` and press Enter. If Homebrew is not installed, you need to install it first by running the following command in Terminal:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Alternatively, use the official installer: Visit the Node.js official website. Download the macOS .pkg installer. Open the downloaded .pkg file and follow the prompts to complete the installation.
# Step 2: Verify installation: Open Command Prompt (cmd) or your IDE terminal, and type `node -v` and `npm -v` to check if Node.js and npm are installed correctly.
After installation, follow these steps:
# Step 1: Download the code package
# Step 2: Extract the code package
# Step 3: Open the code package with your IDE and navigate into the code directory
# Step 4: In the IDE terminal, run the command to install dependencies: npm i
# Step 5: In the IDE terminal, run `npm run dev` to start the Next.js development server.
# Step 6: Run `npm run build` to validate the production build.
How to develop backend services?
Configure environment variables and install relevant dependencies.If you need to use a database, please use the official version of Supabase.

Learn More
You can also check the help documentation: Download and Building the app（ https://intl.cloud.baidu.com/en/doc/MIAODA/s/download-and-building-the-app-en）to learn more detailed content.