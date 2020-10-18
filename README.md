For Trustly

# github-file-summary-api

It will return JSON data containing a summary of file sizes in a public GitHub repository, grouped by file extension.

### Example of request/response

#### Request
```
GET api-basename-url/?repo=abbluiz/ps1-gen
```
Where `abbluiz/ps1-gen` is a GitHub public repository in the form of `owner/repo`.

### Response
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

Where `""` is the group of files that does not have any extensions.


