Commit convention
==================

* Example of a good commit

```
client.ts: Add Signup function   

signup function receives the signature of the server 
by communicating personal information with the server.

Closes #10
```

* ```
  client.ts: Add Signup function
  ```
    - Describe the change in maximum of 50 characters. 

* ```
  signup function receives the signature of the server 
  by communicating personal information with the server.
  ```
    - Describe the reasoning of your changes in maximum of 72 characters per line.

* ```
  Closes #10
  ```
    - Mention the issue number it closes or fixes.

Commit message 3 Parts
-----------------------

A commit message consists of 3 parts:

- short log
- commit body
- issue reference

### Short log

- Maximum of 50 characters.
- Should describe the *change* - the action being done in the commit.
- Should have a tag and a short description separated by a colon (`:`)

   - **Tag**
      - The file or folder or class being modified.
      - Not mandatory but recommended.

   - **Short Description**

      - Starts with a capital letter.
      - Written in imperative present tense (i.e. `Add something`, not
        ``Adding something`` or ``Added something``).
      - Do not add `.` at the end of the sentence.

### Commit body

- Maximum of 72 chars excluding new-line for *each* line.
- Not mandatory - but helps explain what you're doing.
- Should describe the reasoning for your changes. This is especially
  important for complex changes that are not self-explanatory.

### Issue reference

- Should use the `Fixes` keyword if your commit fixes a bug, or `Closes`
  if it adds a feature/enhancement.
- In some situations, e.g. bugs overcome in documents, the difference
  between `Fixes` and `Closes` may be very small and subjective.
  If a specific issue may lead to an unintended behaviour from the user
  or from the program it should be considered a bug, and should be
  addresed with `Fixes`. 
- In case your commit does not close an issue, but if it is related to
  the issue and partly solves the problem, use `Related to` instead
  of `Fixes` or `Closes`.
- Should use Issue number.
- There should be a single space between the `Fixes`, `Closes` or
  `Related to` and the URL.
