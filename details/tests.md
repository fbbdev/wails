# Test suite features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)

## Feature list

- Optional:
    - split Go code and generator output:
        - Go code goes in a folder named e.g. `testcases`;
        - output stays in `testdata`;
    - split output into separate folders for each configuration instead of mixing files with different names;
    - pick up test cases and want/got files automatically (using `os.ReadDir`) so that test code does not need further updates;
    - future: test error/warning messages?

## Discussion

Test suite features are mostly quality-of-life improvements for maintainers.

Splitting Go code from testdata is necessary because Go package patterns do not work under the testdata directory. In order to better automate tests, it is useful to load packages with a pattern of the form `path/...`.

My experimental branch demoes this kind of layout.

I also automated test matrix generation: analyser and generator tests on my branch read `testcases` and `testdata` folders to construct automatically a list of tests and expectations.

With this approach, adding or editing test cases does not require code edits: one just drops new test files in the `testcases` folder.
