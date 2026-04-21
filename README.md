# Simple Angular Project - API Fetching

Simple Angular project that demonstrates routing, route guards, reactive forms, shared app state, and combining data from multiple public APIs.

## What This Project Does

- Loads users from DummyJSON.
- Lets you "log in" by entering first name and last name of an existing DummyJSON user.
- Protects the main app route with an auth guard.
- Shows a browser of users (excluding the logged-in user).
- Filters users by last name.
- Opens user detail and enriches it with:
	- predicted gender from Genderize API
	- location details from Zippopotam API
- Tracks session data in app state (click count and detail-view history).

## APIs Used

- https://dummyjson.com/users
- https://api.genderize.io
- https://api.zippopotam.us

## Tech Stack

- Angular 20 (standalone components)
- TypeScript
- RxJS
- Angular Router
- Reactive Forms

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm start
```

3. Open:

```text
http://localhost:4200
```

## Available Scripts

- `npm start` - run development server (`ng serve`)
- `npm run build` - build production bundle