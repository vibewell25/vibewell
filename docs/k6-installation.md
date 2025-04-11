# Installing k6 for Load Testing

This guide explains how to install k6, a modern load testing tool used for testing the performance of our Redis rate limiting implementation.

## macOS Installation

Using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install k6
brew install k6
```

## Linux Installation

### Ubuntu/Debian

```bash
# Add the k6 repository
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

# Add the repository to your sources
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list

# Update and install
sudo apt-get update
sudo apt-get install k6
```

### CentOS/RHEL

```bash
# Create a new repo file
sudo tee /etc/yum.repos.d/k6.repo<<EOF
[k6]
name=k6 Repository
baseurl=https://dl.k6.io/rpm/stable
enabled=1
gpgcheck=1
gpgkey=https://dl.k6.io/key.gpg
EOF

# Install k6
sudo yum install k6
```

## Windows Installation

Using Chocolatey:

```powershell
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install k6
choco install k6
```

Using the installer:

1. Download the Windows installer from [k6.io/docs/getting-started/installation](https://k6.io/docs/getting-started/installation/)
2. Run the installer and follow the installation wizard
3. Verify the installation by running `k6 version` in Command Prompt or PowerShell

## Docker Installation

If you prefer to use Docker:

```bash
# Pull the k6 image
docker pull grafana/k6

# Run k6 in a container
docker run --rm -i grafana/k6 run - <script.js
```

## Verifying Installation

To verify that k6 is installed correctly, run:

```bash
k6 version
```

You should see output similar to:

```
k6 v0.40.0 (2022-12-21T12:53:32+0000/4ef80635, go1.19.4, darwin/arm64)
```

## Optional: Installing HTML Report Generator

To generate HTML reports from k6 test results:

```bash
# Install the k6-html-reporter package
npm install -g @k6-contrib/html-report
```

## Troubleshooting

If you encounter issues with the installation:

1. **Command not found**: Ensure the installation directory is in your PATH
2. **Permission errors**: Try using `sudo` for Linux installations
3. **Dependencies missing**: Check the [k6 documentation](https://k6.io/docs/getting-started/installation/) for specific dependencies for your OS

## Next Steps

After installing k6, you can run the load tests as described in the [load testing documentation](./load-testing.md):

```bash
# Make the script executable
chmod +x scripts/load-testing.sh

# Run the load tests
./scripts/load-testing.sh
``` 