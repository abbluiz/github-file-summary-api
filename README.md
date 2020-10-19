Made for Trustly

# github-file-summary-api

An API that returns a file size summary of a given GitHub public repository, grouped by file extension. Live demo available at `https://labb-gh-summary.herokuapp.com`.

## Summary

[Example](#example)
* [Request](#request)
* [Response](#response)

[Running the API](#running-the-api)
* [Setting Up Your Environment](#setting-up-your-environment)

[Query Parameters](#query-parameters)
[Queue System](#queue-system)
[Web Scraping](#web-scraping)

[Recursion Modes](#recursion-modes)
* [Moderate Mode](#moderate-mode)
* [Polite Mode](#polite-mode)
* [Promiscuous Mode](#promiscuous-mode)
* [Enabling Promiscuous Mode](#enabling-promiscuous-mode)

## Example

### Request
```
GET https://labb-gh-summary.herokuapp.com/?repo=abbluiz/ps1-gen
```
Where `abbluiz/ps1-gen` is a GitHub public repository in the form of `owner/repo`. It will check if this is a valid `owner/repo` combo. If it is, it will perform a request to determine what is the default branch of the repo (e. g. master, main, or anything else). If the request returns a 404 error, it most probably means that the repo does not exist or it's not public.

### Response

Status Code: 200 (OK)

```
{
  "": {
    "lines": 21,
    "bytes": 1065
  },
  ".md": {
    "lines": 33,
    "bytes": 928
  },
  ".sh": {
    "lines": 118,
    "bytes": 6144
  }
}
```

Where `""` represents the group of files that does not have any extensions. Bytes will be an estimate, because with web scraping you can't always know for sure the size of the file, because it can be displayed as KB or MB, which will be rounded.

Furthermore, not all repo files have "lines" (e.g. image files, executables, etc). In this case, the bytes are counted but the lines are considered to be 1 on each of those files.

## Running the API

You can test with the live demo at `https://labb-gh-summary.herokuapp.com`, or install node.js & npm, and clone this repository. After that, just run `npm install` inside the repository directory.

### Setting Up Your Environment

First of all, you must create a directory named `config` inside the root of the repository files.

For development environments: a file named `dev.env` inside the root of the repository files. There you can set `PORT={NUMBER}` to change the port and `PROMISCUOUS=true|false` to enable/disable promiscuous mode (disabled by default). Start the API with `npm run dev`.

For production environments: same thing, but file is named `prod.env` and `npm run start2` to start API.

For testing environments: same thing, but file is named `test.env` and `npm run test` to start API.

## Query Parameters

* `?repo=owner/repo`: `owner` must be a valid GitHub username (individual or organization). `repo` must be a valid GitHub repository name.

GitHub usernames cannot have more than 39 characters, accept hyphens (-) but cannot start or finish with hyphens or have consecutive hyphens, and only accepts alphanumeric characters (case insensitive).

Repository names are more flexible. They can have up to 100 characters, and can have alphanumeric characters, dashes, dots, and underscores.

Shout out to this CC0-licensed repository for information about this: https://github.com/shinnn/github-username-regex

* `?mode=moderate|polite|promiscuous`: only these three modes are acceptable, however `promiscuous` is not enabled by default. The default value is `moderate`.

This will set the "agressiveness" of the web scraping performed by the API. `polite` mode is the slowest and nicest for GitHub, `moderate` is slow and OK for GitHub, and `promiscuous` is the fastest and quite nasty for GitHub. In fact, `promiscuous` mode will most certainly cause GitHub to answer with 429 Errors (Too Many Requests) if the given repository is big enough.

## Queue System

Once a request is made, it will enter in a job queue. While it is being resolved, or waiting in the queue, the API will answer with the following response:

Status Code: 202 (Accepted)

```
{
  "info": "Server has started building repository summary. Come back in a moment for the results."
}
```

You must perform another request to the same URL (with the same parameters) in another time to get the results. Once the results are returned as demonstrated from the earlier example, it will remain in a cache for 6 hours.

## Web Scraping

The web scraping technique utilized in this API consists in creating a "fake DOM" on the server. Once this DOM is loaded, you can use jQuery-like CSS selectors to filter the data of the pages.

In order to get the fake DOM loaded, I have used Cheerio.

## Recursion Modes

The API will crawl the repo files in a recursive manner. Each time the recursion finds a file page, it uses the fake DOM to find information about the size (lines and bytes of a repository file) in the page, and updates an object with the sum of the lines and bytes for a particular file extension.

### Moderate Mode

The `moderate` mode is the default. It will perform concurrent requests to GitHub in chunks of a maximum of 5 requests, and with a 2-second interval between chunks. This is faster than `polite` mode, but still much slower than `promiscuous` mode. It will handle any repository size.

### Polite Mode

The `polite` mode will traverse through the repository in a recursive manner, just like the other modes, but it will not perform concurrent requests, waiting for each request to finish in order to start the next. It will handle any repository size.

### Promiscuous Mode

The `promiscuous` mode is not enabled by default. It will use recursion in a manner which will make dozens of requests per second by making unlimited concurrent requests during recursion. However, this will only work with small repositories, or medium-sized repository that does not have multiple files in one directory. This is because GitHub will not tolerate this ammount of requests and will send 429 errors back. 

### Enabling Promiscuous Mode

This will not be enabled by default and it is not enabled on the live demo. To enable it, you must follow the [Setting Up Environment](#setting-up-environment) section and add this line to the environment file:

```
PROMISCUOUS=true
```
