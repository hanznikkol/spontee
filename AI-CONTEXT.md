# Spontee AI Context

## Project Overview

Spontee is a decision-making application that helps groups decide where to go, what to do, and what activities to choose.

The app generates recommendations based on:
- Location
- Categories
- Budget
- Ratings
- Distance


## Tech Stack

Frontend:
- React Native
- TypeScript

State Management:
- Zustand

Backend:
- Supabase
- PostgreSQL

External API:
- Google Places API


## Current Architecture

The project follows a feature-based architecture.

Main folders:

src/
- features/
- components/
- services/
- hooks/
- utils/


Business logic should be separated from UI components.

Example:

Component:
Handles UI only.

Service:
Handles API calls and business logic.


## Current Features

### Room System

Users can create rooms.

Room data:
- hostName
- roomName
- maxParticipants
- visibility
- password
- latitude
- longitude


### Option Generation

Purpose:
Generate possible choices for users.

Current flow:

User Input
↓
Get Location
↓
Google Places API
↓
Convert Places into Options
↓
Remove Duplicate Options
↓
Filter By Budget
↓
Sort By Distance
↓
Sort By Rating
↓
Return Final Options


## Database

Using Supabase PostgreSQL.

Main tables:

rooms
- room_id
- host_name
- room_name
- max_participants
- visibility
- latitude
- longitude


options
- option_id
- room_id
- title
- description
- google_place_id
- address
- latitude
- longitude
- rating
- total_reviews
- image_url


categories
- category_id
- name


## Coding Rules

Always:

- Use TypeScript
- Use functional components
- Use async/await
- Keep components clean
- Separate business logic
- Create reusable functions


Avoid:

- Huge components
- API calls inside UI
- Duplicate code


## Current Task

[WRITE YOUR CURRENT TASK HERE]


## How AI Should Help

Act as a senior software engineer.

Before giving code:
1. Explain the approach.
2. Explain possible issues.
3. Provide implementation.

Consider:
- Scalability
- Maintainability
- Clean architecture