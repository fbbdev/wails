# General features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Concurrency](#concurrency)

## Feature list

- Essential:
    - sane fallbacks for each unsupported construct;
    - emit a message for each unsupported construct;
    - emit a message for each unrecoverable error.
- Optional:
    - concurrency;
    - verbose logging mode with debug messages;
    - dry run mode (no output files, just logging);
    - warning/error deduplication;
    - spinner with status messages.

## Discussion

These are features that either apply to every area or fit no other category.

Dry run mode means that the generator runs fully, down to executing each template, but does not write output files. This is useful to check for errors without corrupting files. It is also very useful for testing, as it will still trigger panics.

This feature is very easy to implement (and in fact I have been using it a lot already) with the pluggable file creation system I have in my experiment.

I also experimented with a verbose mode flag that prints the list of discovered bound types and output files. This is useful in conjunction with dry runs to get a rough preview of results. Other debug messages can be added easily if desired, for example one might want to report discovered model types too.

### Concurrency

Concurrency is not strictly necessary and probably does not improve execution time that much, as it seems most of the time is spent loading packages. A sequential driver that performs each step and feeds results to the next one is perfectly fine.

However, a concurrent architecture has three important benefits:

- it promotes modularity, so as to reduce interaction between parallel tasks or avoid it altogether;
- it flattens call hierarchies, making bugs less likely to have non-local effects and easier to pinpoint;
- it makes error recovery very simple: as soon as a goroutine encounters an error, it logs the error and stops; all independent tasks carry on. This in turn produces richer error reports and improves UX by much.

In my experimental branch I implemented a coarse task-based architecture with the following kind of tasks:

- root task: coordination + static analysis;
- bound type task: data collection + code generation for _one bound type_;
- model collection task: data collection for _one model type_;
- model generation task: model code generation for _one package_;
- index generation task: index file generation for _one package_;

The resulting architecture is IMO clean and easy to understand. It requires little synchronisation, mostly handled by `sync.Map` and `sync.Once`, plus very few mutexes where appropriate (for write-heavy workloads, mutex+map or slice is known to be much faster than `sync.Map`). Each task maps to one goroutine. Doc comments specify whether a method can be called concurrently or not.

For model import lists I used a map/reduce approach to reduce synchronisation: they are computed separately for each model type, then merged just before generating a model file.

The generator entry point waits for all pending tasks to terminate before returning control to the calling function.
