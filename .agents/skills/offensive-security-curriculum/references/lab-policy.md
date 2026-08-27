# Lab Policy and Architecture

## Universal rules

- Use only intentionally vulnerable, owned, or explicitly authorized targets.
- Bind local services to loopback or an isolated lab network by default.
- Never accept an arbitrary hostname, IP, domain, account, or cloud subscription as
  an attack target.
- Use synthetic identities, credentials, and data.
- Provide setup, health check, success criteria, reset, cleanup, and resource limits.
- Make destructive state disposable and recoverable.
- Capture telemetry and require mitigation verification.
- Document platform, CPU, memory, storage, license, and cost prerequisites.

## Lab modes

### `browser-demo`

Use for mental models and bounded UI/application behavior that does not require a
real OS, network boundary, or backend. A demo must be labeled as simulation.

### `wasm-sandbox`

Use for WebAssembly-native real execution (BusyBox WASM, POSIX VFS, In-Memory AST SQL,
and HTTP/Packet Inspector) running client-side with deterministic auto-grading state assertions.

### `local-container`

Use for HTTP/API, multiple services, packet paths, queues, caches, and bounded
distributed behavior. Pin image versions and isolate the network.

### `local-vm`

Use for Linux/Windows permissions, host services, Active Directory, kernel or
endpoint telemetry. Provide snapshots/rebuild instructions. Do not expose an
intentionally vulnerable VM to the public Internet.

### `cloud-sandbox`

Use only when cloud control-plane behavior is essential. Require a dedicated lab
account/project, least-privilege bootstrap, budget guard, region constraints,
inventory, and verified destroy procedure.

### `external-platform`

Link to a maintained authorized training platform. State account/cost requirements,
map exact objectives, and do not copy copyrighted solutions into the repository.

### `instructor-controlled`

Use for high-risk availability, malware/C2, social, physical, or advanced emulation
topics. The content teaches planning, telemetry, containment, and defense; execution
requires explicit supervision and an isolated environment.

## Safety levels

- `safe`: bounded browser or documentation exercise with no external side effect.
- `isolated-only`: containers/VMs that may exhibit offensive behavior only inside a
  private lab.
- `instructor-controlled`: material with meaningful dual-use risk, operational cost,
  or organizational impact.

## DDoS and botnet simulation

Teach architecture, detection, resilience, and incident response—not Internet attack
execution. A valid lab has:

- fixed local targets;
- fixed agent count, concurrency, packet/request rate, duration, and payload size;
- no arbitrary destination field;
- no scanning, propagation, persistence, credential access, or remote enrollment;
- a visible emergency stop and automatic timeout;
- baseline, saturation, mitigation, and recovery measurements;
- logs suitable for a defender to build and test a detection.

## Malware and C2 simulation

Prefer benign agents that perform an allowlisted action set and emit complete
telemetry. No stealth installation, uncontrolled persistence, real credential
collection, public listener, or bypass recipe. Tie behavior to ATT&CK for detection
validation only when the mapping is accurate.

## Recommended external labs

- OWASP Juice Shop and PortSwigger Web Security Academy for web/API.
- GOAD for an isolated Active Directory range.
- CloudGoat for a dedicated disposable cloud sandbox.
- Atomic Red Team and MITRE CALDERA for controlled detection/adversary-emulation
  validation.

Recheck maintenance, license, prerequisites, warnings, and current documentation
before adding any external lab to a lesson.
