# Student Portal Frontend

This is the frontend application for the Student Portal system, built with Next.js and TypeScript.

## Environment Configuration

The application uses environment variables for configuration. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

You can adjust the API URL based on your environment:
- Development: `http://localhost:3001/api`
- Production: Set this to your production API URL

## Development

To start the development server:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Features

- User authentication (login/logout)
- Dashboard with student information
- Front office management
- Ticket management system
- Attendance management
- Gate pass management
- Biometric management

## Build

To build the application for production:

```bash
npm run build
```

Then you can start the production server:

```bash
npm start
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
