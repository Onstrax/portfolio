# Local replica of the CI environment (TST §4.10): Ubuntu 24.04, Node 24 and the three browsers
# of Playwright. The tag must be the exact version of @playwright/test in package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-noble

# Same pnpm as the `packageManager` field of package.json.
RUN npm install --global pnpm@11.28.4

# The checks run as the host user, so that the files they write are not owned by root.
ENV HOME=/tmp/home
RUN mkdir -p /tmp/home && chmod 1777 /tmp/home

# compose.yaml mounts the repository here; nothing is copied into the image.
WORKDIR /work
