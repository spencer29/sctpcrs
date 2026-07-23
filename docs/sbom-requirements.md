# SBOM Requirements — sctpcrs

> **Software Bill of Materials (SBOM)** — a formal, machine-readable inventory of all software components, their versions, licenses, and dependency relationships that make up this application.

---

## 1. Why an SBOM?

| Driver | Detail |
|---|---|
| **Supply-chain security** | Identify vulnerable or malicious transitive dependencies (e.g., log4shell-style events) |
| **License compliance** | Ensure all third-party licenses are compatible with the project's distribution model |
| **Regulatory alignment** | US Executive Order 14028 (May 2021) mandates SBOMs for software sold to the US federal government; NTIA minimum elements apply |
| **Vendor risk management** | Directly supports the vendor-risk workflows already built into this application |
| **Incident response** | When a new CVE drops, instantly know whether any component in the tree is affected |

---

## 2. SBOM Formats Supported

### 2.1 CycloneDX (Primary)
- **Version**: 1.4 (JSON)
- **Output file**: `sbom-cyclonedx.json`
- **Tool**: `@cyclonedx/cyclonedx-npm` (Apache-2.0)
- **Why**: Widest tooling support, native GitHub integration, purpose-built for security use-cases

### 2.2 SPDX (Secondary / Optional)
- **Version**: 2.3 (JSON)
- **Output file**: `sbom-spdx.json`
- **Tool**: `spdx-sbom-generator`
- **Why**: ISO/IEC 5962:2021 international standard; required by some procurement contracts

---

## 3. NTIA Minimum Elements

Per the [NTIA guidelines](https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials), every component entry must include:

| Element | CycloneDX field | Status |
|---|---|---|
| Supplier name | `components[].supplier.name` | ✅ Generated automatically |
| Component name | `components[].name` | ✅ Generated automatically |
| Component version | `components[].version` | ✅ Generated automatically |
| Other unique identifiers | `components[].purl` (Package URL) | ✅ Generated automatically |
| Dependency relationships | `dependencies[]` | ✅ Generated automatically |
| Author of SBOM data | `metadata.tools[]` | ✅ Generated automatically |
| Timestamp | `metadata.timestamp` | ✅ Generated automatically |

---

## 4. CI/CD Integration

### 4.1 Workflow files

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Main CI: lint → type-check → build → SBOM (parallel) |
| `.github/workflows/sbom.yml` | Standalone SBOM workflow (can be triggered manually) |

### 4.2 Trigger conditions

```
Push  → main / master   → full CI + SBOM
PR    → main / master   → full CI + SBOM
Manual (workflow_dispatch) → SBOM only
```

### 4.3 Artifacts produced per run

| Artifact | Retention | Description |
|---|---|---|
| `sbom-<sha>.zip` | 90 days | CycloneDX JSON + SPDX JSON |
| `license-report-<sha>.zip` | 90 days | Per-package license breakdown |
| `nextjs-build-<sha>.zip` | 7 days | Compiled `.next/` directory |

Artifacts are downloadable from **GitHub Actions → workflow run → Artifacts**.

### 4.4 GitHub Dependency Graph submission

The workflow submits the SPDX SBOM to GitHub's [Dependency Submission API](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/using-the-dependency-submission-api). This powers:
- **Dependabot alerts** for transitive dependencies
- **Dependency graph** visualization in the repository's *Insights* tab

**Required repository setting**: Settings → Code security → Dependency graph → **Enabled**

---

## 5. Generating an SBOM Locally

### Prerequisites
```bash
node >= 18
npm >= 9
```

### CycloneDX (recommended)
```bash
# Install globally (one-time)
npm install -g @cyclonedx/cyclonedx-npm

# Generate from package-lock.json (no extra install needed)
cyclonedx-npm \
  --output-format JSON \
  --output-file sbom-cyclonedx.json \
  --package-lock-only \
  --flatten-components

# Or via npx (no global install)
npx @cyclonedx/cyclonedx-npm \
  --output-format JSON \
  --output-file sbom-cyclonedx.json \
  --package-lock-only
```

### SPDX (optional)
```bash
npx spdx-sbom-generator -p . -o sbom-spdx.json -f json
```

### License report
```bash
npx license-checker --production --json --out license-report.json
```

---

## 6. License Allowlist

The CI pipeline enforces the following SPDX license identifiers. Any package outside this list will cause the license-check job to flag a warning:

```
MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0,
CC0-1.0, CC-BY-3.0, CC-BY-4.0, 0BSD, Python-2.0,
Unlicense, BlueOak-1.0.0
```

To add a new allowed license, update the `--onlyAllow` flag in `.github/workflows/sbom.yml` → `license-check` job.

---

## 7. Interpreting the CycloneDX JSON

```jsonc
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "serialNumber": "urn:uuid:<uuid>",   // unique per generation
  "version": 1,
  "metadata": {
    "timestamp": "2026-07-23T10:55:46Z",
    "tools": [{ "vendor": "CycloneDX", "name": "cyclonedx-npm", "version": "..." }],
    "component": { "type": "library", "name": "sctpcrs", "version": "0.1.0" }
  },
  "components": [
    {
      "type": "library",
      "name": "next",
      "version": "15.5.18",
      "purl": "pkg:npm/next@15.5.18",
      "licenses": [{ "license": { "id": "MIT" } }],
      "hashes": [{ "alg": "SHA-256", "content": "..." }]
    }
    // ... all direct + transitive dependencies
  ],
  "dependencies": [
    { "ref": "pkg:npm/sctpcrs@0.1.0", "dependsOn": ["pkg:npm/next@15.5.18", ...] }
  ]
}
```

---

## 8. Vulnerability Scanning with the SBOM

Once you have `sbom-cyclonedx.json`, feed it into a vulnerability scanner:

```bash
# Grype (free, Anchore)
brew install grype          # macOS
grype sbom:sbom-cyclonedx.json

# Trivy (free, Aqua Security)
brew install trivy
trivy sbom sbom-cyclonedx.json

# OSV-Scanner (free, Google)
go install github.com/google/osv-scanner/cmd/osv-scanner@latest
osv-scanner --sbom sbom-cyclonedx.json
```

These tools cross-reference the SBOM against OSV, NVD, and GitHub Advisory databases — directly supporting the CVE monitoring workflows in this application.

---

## 9. Updating & Versioning

| When | Action |
|---|---|
| Every `npm install` / dependency change | Re-run SBOM generation (CI does this automatically) |
| Major version bump | Tag the SBOM artifact with the release version |
| Security incident | Generate a point-in-time SBOM and attach to the incident record |
| Quarterly | Archive SBOM to long-term storage (S3, Artifact Registry, etc.) |

---

## 10. Relevant Standards & References

- [NTIA Minimum Elements for an SBOM](https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials)
- [CycloneDX Specification v1.4](https://cyclonedx.org/specification/overview/)
- [SPDX ISO/IEC 5962:2021](https://spdx.dev/specifications/)
- [CISA SBOM Resources](https://www.cisa.gov/sbom)
- [US Executive Order 14028 — Improving the Nation's Cybersecurity](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/)
- [GitHub Dependency Submission API](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/using-the-dependency-submission-api)
- [OpenSSF SBOM Everywhere SIG](https://github.com/ossf/sbom-everywhere)
