# TogglTempo

A small tool for ingesting daily worklogs from toggl to tempo

## Getting Started
- run `yarn` (or `npm i`)

## Usage

- run `node src/index.js`.
- It will ask for your toggl email and password
- It will also ask for your tempo workerID.
- To obtain your JIRA Worker ID, visit Atlassian, click your avatar, then click 'Profile'. The workerID is the last part of the URL.
- Your Tempo API key can be obtained by going to Tempo -> Settings -> API Integration and creating a new token.

EG: If the URL was https://YOURURL.atlassian.net/jira/people/557058:99650e6c-22c9-4241-ae3b-f8e2c7b140e6

your WorkerID would be `557058:99650e6c-22c9-4241-ae3b-f8e2c7b140e6`

## Requirements

This relies on the Toggl time entry's description for obtaining the correct JIRA issue key. The formats of your descriptions should be `<issueKey> <description>` -- the description part is optional.

If it does not find an entry with the issueKey specified, it will skip logging the entry...

## Development
- set the env variable `DRY_RUN=true` to skip logging the time entries.
- set the env variable `DEBUG=true` to enable error logging
