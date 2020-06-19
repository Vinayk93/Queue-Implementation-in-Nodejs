## Queue Implementation
### Process
1. Consumer can be add dynamically
2. Sending can be allowed at anywhere

### How it works
1. A Log is generated append only(kafka architecture)
2. Single counter allowed to read and process with the retry functions(Currently FIFO only)
