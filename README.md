For Trustly

# github-file-summary-api

It will return JSON data containing a summary of file sizes of a public GitHub repository, grouped by file extension. This is achieved with web scraping.

### Example of request/response

#### Request
```
GET https://labb-gh-summary.heroku.com/?repo=abbluiz/ps1-gen
```
Where `abbluiz/ps1-gen` is a GitHub public repository in the form of `owner/repo`. It will check if this is a valid `owner/repo` combo. If it is, it will perform a request to determine what is the default branch of the repo (e. g. master, main, or anything else). If the request returns a 404 error, it most probably means that the repo does not exist or it's not public.

#### Response
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

Where `""` is a group of files that does not have any extensions. Bytes will be an estimate, because with web scraping you can't always know for sure the size of the file, because it can be displayed as KB or MB, which will be rounded.

Furthermore, not all repo files have "lines" (e.g. image files, executables, etc). In this case, the bytes are counted but the lines are considered to be 1 on each of those files.

### Cache

The results of a particular request will be saved in a cache for 6 hours before expiring.

### Web Scraping Technique

For web scraping I have created a "fake DOM" on the server. With this DOM, I can filter data using jQuery-like css selectors. To load the fake DOM, I have used the library Cheerio.

### Promiscuous Mode

You can pass `?mode=promiscuous` to the request if you want to enable this mode, which will make dozens of requests per second by making concurrent asynchronous requests. However, this will not work for big repositories, because GitHub will send "429 Too Many Requests" Error responses. 

### Default Mode

If you don't pass the promiscuous mode option, the recursion will be much slower, taking a few minutes to crawl a big repository.
