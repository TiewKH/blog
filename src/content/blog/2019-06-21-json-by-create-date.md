---
title: "Editing Newest JSON File In A Directory"
date: 2019-06-21
description: "This post shows how to edit the newest (by create date) JSON file from a Windows directory"
---

This post shows how to edit the newest (by create date) JSON file from a Windows directory. In this example, we are using Python 3.6.

First, we have to load the needed libraries.
```python
from stat import S_ISREG, ST_CTIME, ST_MODE
import os, time
import json
```

Then, we have to get all JSON files from a directory. Replace the directory here with the directory you want.
```python
directory = "C:/Users/tiewkeehui/JsonFiles/"
entries = (os.path.join(directory, fn) for fn in os.listdir(directory) if fn.endswith('.json'))
entries = ((os.stat(path), path) for path in entries)
```

Then we add the stats of all the files
```python
entries = ((stat[ST_CTIME], path) for stat, path in entries if S_ISREG(stat[ST_MODE]))
```
S_ISREG checks if the file is a normal file (ex. not a directory). It will return a non-zero value if it is a regular file.

Now we get the latest created JSON file
```python
json_file_path = sorted(entries)[-1][1]
```

Last but not least, we open and load the JSON file and add our new key-value pair. After that, we overwrite the existing file.
```python
with open(json_file_path, encoding="utf-8-sig") as json_file:
    data = json.load(json_file)
    data['new_key'] = new_value

    with open(json_file_path, 'w') as f:
        json.dump(data, f)
```

References:
1. [https://docs.python.org/3.6/library/stat.html](https://docs.python.org/3.6/library/stat.html)
2. [https://stackoverflow.com/questions/40163270/what-is-s-isreg-and-what-does-it-do](https://stackoverflow.com/questions/40163270/what-is-s-isreg-and-what-does-it-do)
3. [https://en.wikipedia.org/wiki/Stat_(system_call)](https://en.wikipedia.org/wiki/Stat_(system_call))
4. [https://stackoverflow.com/a/539024](https://stackoverflow.com/a/539024)
