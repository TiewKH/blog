---
title: "Shutting Down Python's ThreadPoolExecutor"
date: 2021-07-10
description: "To cancel pending futures during shutdown of ThreadPoolExecutor for Python 3.7, 3.8 and 3.9"
---

ThreadPoolExecutor is the recommended way to perform multithreading in Python. Multithreading is a way to speed up your application and is suitable for I/O bound tasks such as HTTP requests, database operations, etc. 

# Introduction
The simplest way to show how to use ThreadPoolExecutor is by example:
```python
from concurrent.futures import as_completed, ThreadPoolExecutor

def task(num):
    return f"I'm running in a thread: {num}"

futures = []
with ThreadPoolExecutor(max_workers=2) as executor:
    for i in range(1, 11):
        futures.append(executor.submit(task, i))

    for future in as_completed(futures):
        print(future.result())
```

The application above will print the statement "I'm running in a thread: " with the number 1 to 10, which will most probably be out of order.

## Code Explanation
First, we created a ThreadPoolExecutor with 2 threads. Then, we submit 10 tasks to the ThreadPoolExecutor with a for-in loop, and in turn receive Future objects which we store in a list. We then loop through the list of futures using the as_completed() function, which allows us to receive futures that complete first instead of going sequentially through the futures list. Finally, we obtain the result of the task() function by calling future.result() and print the outcome.

## Handling Exceptions
The example above was super simple, but what if we need to do something more complicated like firing concurrent HTTP requests. There is a possibility that the code may hit Exceptions during runtime due to uncontrollable reasons i.e. network issues, configuration issues. We can put a try-except block to handle Exceptions, but **what if we want to cancel all submitted tasks when a future fails?**

## Shutdown
There is a built in function for ThreadPoolExecutor called shutdown().

In Python 3.7 and 3.8, shutdown() only stops the ThreadPoolExecutor from accepting new tasks. This means that if we submit all our tasks in one go at the beginning, and mid-way through a task fails which causes the future to return an Exception, other pending tasks that have not started running and are still in the executor's job queue will NOT be cancelled.

Fortunately, it was revamped in Python 3.9 to allow users to cancel pending tasks in the executor's job queue.

### Python 3.7 and 3.8
At the time of writing this blog post I was using Python 3.7.10 and Python 3.8.5.

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=2) as executor:
    executor.shutdown(wait=True)
```

In Python 3.7 and 3.8, shutdown() only accepts one boolean parameter, wait. When wait = True, Python will wait until all submitted tasks have finished running before shutting down the ThreadPoolExecutor.

When wait = False, it will still behave in the same way. The only difference is that the call to executor.shutdown() will not block. The executor will continue running all pending tasks, but will not accept new tasks and will completely shut down after all tasks are ran. Meanwhile, the main thread continues with our script's main execution flow.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import time

def task(num):
    if num == 5:
        raise ValueError("Num is 5")
    else:
        # To ensure this task doesn't complete too fast
        time.sleep(1)
    return f"I'm running in a thread: {num}"

futures = []
with ThreadPoolExecutor(3) as pool:
    futures = [
        pool.submit(task, i) for i in range(1,10)
    ]

    for future in as_completed(futures):
        try:
            n = future.result()
            print(f"{datetime.now()} - {n}")
        except ValueError as e:
            print(f"{datetime.now()} - EXCEPTION! {e}")
            pool.shutdown(wait=True)

print(f"{datetime.now()} - Run complete")
```

In the code example above, a ValueError exception will be raised when num = 5. After hitting the ValueError exception, the script will call shutdown().

When wait = True, Python will wait for all futures after num = 5 to complete and print it out (almost) all at once.

```shell
2021-07-10 11:42:15.382637 - I'm running in a thread: 1
2021-07-10 11:42:15.383645 - I'm running in a thread: 2
2021-07-10 11:42:16.389649 - I'm running in a thread: 4
2021-07-10 11:42:16.389885 - EXCEPTION! Num is 5
2021-07-10 11:42:18.397034 - I'm running in a thread: 3
2021-07-10 11:42:18.397034 - I'm running in a thread: 7
2021-07-10 11:42:18.398046 - I'm running in a thread: 6
2021-07-10 11:42:18.398046 - I'm running in a thread: 9
2021-07-10 11:42:18.399038 - I'm running in a thread: 8
2021-07-10 11:42:18.400030 - Run complete
```

Since wait = True, after handling the ValueError exception, the main thread will wait for all tasks in the job queue to complete, before returning to the for-in loop to receive completed futures from as_completed() and to print out the results. Notice that the results printed after the ValueError exception are printed at approximately the same time.

Meanwhile, when wait = False, Python will continue with the main thread's execution flow.

```shell
2021-07-10 11:46:00.282762 - I'm running in a thread: 1
2021-07-10 11:46:00.283760 - I'm running in a thread: 2
2021-07-10 11:46:01.283596 - I'm running in a thread: 4
2021-07-10 11:46:01.284606 - EXCEPTION! Num is 5
2021-07-10 11:46:01.286596 - I'm running in a thread: 3
2021-07-10 11:46:02.285767 - I'm running in a thread: 7
2021-07-10 11:46:02.287289 - I'm running in a thread: 6
2021-07-10 11:46:03.296363 - I'm running in a thread: 9
2021-07-10 11:46:03.297305 - I'm running in a thread: 8
2021-07-10 11:46:03.299306 - Run complete
```

Since wait = False, after handling the ValueError exception, the main thread immediately continues with the script's execution flow, which is to wait and receive completed futures from as_completed() and to print out the results. Notice that the results printed after the ValueError exception are printed as each future completes.

You can check out the shutdown() code for [Python 3.7](https://github.com/python/cpython/blob/3.7/Lib/concurrent/futures/thread.py#L210-L216) and [Python 3.8](https://github.com/python/cpython/blob/3.8/Lib/concurrent/futures/thread.py#L230-L236) at GitHub.

### Python 3.9
At the time of writing this blog post, I was using Python 3.9.5.

In Python 3.9, an additional boolean parameter, cancel_futures, was added to shutdown(). This allows us to cancel pending futures in the queue that have not started running if any future fails mid-way through. However, there is a catch. If you use the as_completed() function, the script will be stuck indefinitely after calling executor.shutdown() because as_completed() is not triggered when a future is in the CANCELLED state.

As you can see [here](https://github.com/python/cpython/blob/302df02789d041a09760f86295ea6b4dcd81aa1d/Lib/concurrent/futures/_base.py#L227), as_completed() only returns a future if it is in the CANCELLED_AND_NOTIFIED or FINISHED state. Meanwhile, [executor.shutdown() only cancels the future](https://github.com/python/cpython/blob/302df02789d041a09760f86295ea6b4dcd81aa1d/Lib/concurrent/futures/thread.py#L222) but does not change its state to CANCELLED_AND_NOTIFIED.

To confirm it, we can run this block of code below.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import time

def task(num):
    if num == 5:
        raise ValueError("Num is 5")
    else:
        # To ensure this task doesn't complete too fast
        time.sleep(1)
    return f"I'm running in a thread: {num}"

with ThreadPoolExecutor(2) as pool:
    futures = [
        pool.submit(task, i) for i in range(1,10)
    ]

    for future in as_completed(futures):
        print([f._state for f in futures])
        try:
            n = future.result()
            print(f"{datetime.now()} - {n}")
        except ValueError as e:
            print(f"{datetime.now()} - EXCEPTION! {e}")
            pool.shutdown(wait=False, cancel_futures=True)

print(f"{datetime.now()} - Run complete")
```

We are printing the states of all the futures every time we enter the for-in loop. The results of the block of code above is as shown below:

```shell
['RUNNING', 'FINISHED', 'RUNNING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
2021-07-10 12:24:10.208194 - I'm running in a thread: 2
['FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
2021-07-10 12:24:10.209194 - I'm running in a thread: 1
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING']
2021-07-10 12:24:11.212126 - I'm running in a thread: 3
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING']
2021-07-10 12:24:11.213099 - EXCEPTION! Num is 5
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'CANCELLED', 'CANCELLED']
2021-07-10 12:24:11.215099 - I'm running in a thread: 4
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'FINISHED', 'CANCELLED', 'CANCELLED']
2021-07-10 12:24:12.217437 - I'm running in a thread: 7
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'CANCELLED', 'CANCELLED']
2021-07-10 12:24:12.218478 - I'm running in a thread: 6
```

We can see that after the ValueError exception is handled, the last two futures changes state from PENDING to CANCELLED. The script will then be stuck because as_completed() never returns the remaining two futures.

### What To Do
The way I fixed this is to scrap using the as_completed() function. Although it is the recommended way to loop through a list of futures, it's useless if it causes the script to hang.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import time

def task(num):
    if num == 5:
        raise ValueError("Num is 5")
    else:
        # To ensure this task doesn't complete too fast
        time.sleep(1)
    return f"I'm running in a thread: {num}"

with ThreadPoolExecutor(2) as pool:
    futures = [
        pool.submit(task, i) for i in range(1,10)
    ]

    for future in futures:
        print([f._state for f in futures])
        if future.cancelled():
            continue
        try:
            n = future.result()
            print(f"{datetime.now()} - {n}")
        except ValueError as e:
            print(f"{datetime.now()} - EXCEPTION! {e}")
            pool.shutdown(wait=False, cancel_futures=True)

print(f"{datetime.now()} - Run complete")
```

Now, we are going through the list of futures sequentially. We are also checking if the future is in CANCELLED state and if it is, we proceed to the next future. We have successfully avoided the never-ending as_completed() function when .shutdown(cancel_futures=True) is called.

The output of the code above will look like:
```shell
['RUNNING', 'RUNNING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
2021-07-10 12:46:30.983909 - I'm running in a thread: 1
['FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
2021-07-10 12:46:30.986902 - I'm running in a thread: 2
['FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
2021-07-10 12:46:32.002421 - I'm running in a thread: 3
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING']
2021-07-10 12:46:32.004655 - I'm running in a thread: 4
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'PENDING', 'PENDING']
2021-07-10 12:46:32.006840 - EXCEPTION! Num is 5
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'RUNNING', 'RUNNING', 'CANCELLED', 'CANCELLED']
2021-07-10 12:46:33.008187 - I'm running in a thread: 6
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'CANCELLED', 'CANCELLED']
2021-07-10 12:46:33.010195 - I'm running in a thread: 7
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'CANCELLED', 'CANCELLED']
['FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'FINISHED', 'CANCELLED', 'CANCELLED']
2021-07-10 12:46:33.013183 - Run complete
```

### Bonus: I Want To Cancel Futures On Shutdown in Python 3.7 and 3.8
With a bit of knowledge of object-oriented programming, we can! Simply inherit the ThreadPoolExecutor class and add a new method (in case we still want the original shutdown()) with [Python 3.9's version of shutdown().](https://github.com/python/cpython/blob/302df02789d041a09760f86295ea6b4dcd81aa1d/Lib/concurrent/futures/thread.py#L210-L229)

```python
from concurrent.futures import ThreadPoolExecutor
import queue

class CustomThreadPoolExecutor(ThreadPoolExecutor):
    def shutdown39(self, wait=True, *, cancel_futures=False):
        with self._shutdown_lock:
            self._shutdown = True
            if cancel_futures:
                # Drain all work items from the queue, and then cancel their
                # associated futures.
                while True:
                    try:
                        work_item = self._work_queue.get_nowait()
                    except queue.Empty:
                        break
                    if work_item is not None:
                        work_item.future.cancel()

            # Send a wake-up to prevent threads calling
            # _work_queue.get(block=True) from permanently blocking.
            self._work_queue.put(None)
        if wait:
            for t in self._threads:
                t.join()
```
