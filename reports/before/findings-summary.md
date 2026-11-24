
# EventHub - Semgrep Baseline Findings

## 1. Automatic Semgrep Scan

- Tool: Semgrep
- Version: 1.186.0
- Rules executed: 251
- Files scanned: 24
- Findings: 0
- Blocking findings: 0
- Result: Scan completed successfully.

## 2. Custom Semgrep Scan

- Rule ID: direct-request-body-in-create
- Rule file: semgrep-rules/input-validation.yml
- Pattern: $MODEL.create(req.body)
- Language: JavaScript and TypeScript
- Configured severity: WARNING
- Backend files scanned: 7
- Findings: 0
- Result: Scan completed successfully.

## 3. Custom Rule Verification

A temporary test file was created to verify the custom rule.

- Test file: backend/semgrep-test.js
- Test pattern: Event.create(req.body)
- Expected detection: Direct use of request body in database creation.
- Actual result: 1 finding detected.
- Verification: Successful.
- Temporary test file: Removed after testing.

## 4. Conclusion

The automatic scan reported no findings in the scanned project files.

The custom Semgrep rule successfully detected the unsafe request-body pattern during controlled testing. Further security review and remediation may still be required.
