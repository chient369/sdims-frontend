# SDIMS Frontend S3 Deployment Script (PowerShell)
# Author: SDMS Team
# Version: 1.0

param(
    [string]$BucketName = $env:S3_BUCKET_NAME,
    [string]$Region = $env:AWS_REGION,
    [string]$Profile = $env:AWS_PROFILE,
    [string]$CloudFrontDistributionId = $env:CLOUDFRONT_DISTRIBUTION_ID,
    [switch]$SkipBuild,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$BuildDir = "dist"
$DefaultRegion = "ap-southeast-1"

# Functions
function Write-Header {
    param([string]$Title)
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "         $Title" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "Error: $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "Warning: $Message" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Main deployment function
function Start-Deployment {
    Write-Header "SDIMS Frontend S3 Deployment"
    
    # Validate configuration
    if ([string]::IsNullOrWhiteSpace($BucketName)) {
        Write-Error "S3_BUCKET_NAME is required! Please set it as environment variable or pass as parameter."
        Write-Host "Example: .\scripts\deploy.ps1 -BucketName 'my-app-bucket'" -ForegroundColor Yellow
        exit 1
    }
    
    if ([string]::IsNullOrWhiteSpace($Region)) {
        $Region = $DefaultRegion
        Write-Warning "AWS_REGION not specified, using default: $Region"
    }
    
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "  Bucket Name: $BucketName" -ForegroundColor White
    Write-Host "  Region: $Region" -ForegroundColor White
    Write-Host "  Build Directory: $BuildDir" -ForegroundColor White
    if (![string]::IsNullOrWhiteSpace($Profile)) {
        Write-Host "  AWS Profile: $Profile" -ForegroundColor White
    }
    if (![string]::IsNullOrWhiteSpace($CloudFrontDistributionId)) {
        Write-Host "  CloudFront Distribution: $CloudFrontDistributionId" -ForegroundColor White
    }
    Write-Host ""
    
    # Step 1: Check prerequisites
    Write-Step "Checking prerequisites..."
    
    if (!(Test-Command "node")) {
        Write-Error "Node.js is not installed or not found in PATH!"
        exit 1
    }
    
    if (!(Test-Command "npm")) {
        Write-Error "npm is not installed or not found in PATH!"
        exit 1
    }
    
    if (!(Test-Command "aws")) {
        Write-Error "AWS CLI is not installed or not found in PATH!"
        Write-Host "Please install AWS CLI from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 2: Clean previous build
    if (!$SkipBuild) {
        Write-Step "Cleaning previous build..."
        if (Test-Path $BuildDir) {
            Remove-Item $BuildDir -Recurse -Force
            Write-Host "Previous build cleaned." -ForegroundColor Gray
        } else {
            Write-Host "No previous build found." -ForegroundColor Gray
        }
        
        # Step 3: Install dependencies
        Write-Step "Installing dependencies..."
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        }
        catch {
            Write-Error "Failed to install dependencies!"
            exit 1
        }
        
        # Step 4: Build the application
        Write-Step "Building the application..."
        try {
            & npm run build
            if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
        }
        catch {
            Write-Error "Build failed!"
            exit 1
        }
        
        if (!(Test-Path $BuildDir)) {
            Write-Error "Build directory '$BuildDir' not found after build!"
            exit 1
        }
    } else {
        Write-Step "Skipping build (--SkipBuild flag specified)..."
        if (!(Test-Path $BuildDir)) {
            Write-Error "Build directory '$BuildDir' not found! Please run build first or remove --SkipBuild flag."
            exit 1
        }
    }
    
    # Step 5: Deploy to S3
    Write-Step "Deploying to S3..."
    
    # Prepare AWS CLI arguments
    $awsArgs = @("s3", "sync", "$BuildDir/", "s3://$BucketName", "--region", $Region, "--delete", "--exclude", "*.map")
    
    if (![string]::IsNullOrWhiteSpace($Profile)) {
        $awsArgs += @("--profile", $Profile)
    }
    
    if ($Verbose) {
        $awsArgs += "--debug"
    }
    
    Write-Host "Syncing files to s3://$BucketName..." -ForegroundColor Gray
    
    try {
        & aws @awsArgs
        if ($LASTEXITCODE -ne 0) { throw "AWS S3 sync failed" }
    }
    catch {
        Write-Error "Failed to sync files to S3!"
        Write-Host "Please check your AWS credentials and bucket permissions." -ForegroundColor Yellow
        Write-Host "You can test AWS CLI with: aws sts get-caller-identity" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 6: Invalidate CloudFront cache (optional)
    if (![string]::IsNullOrWhiteSpace($CloudFrontDistributionId)) {
        Write-Step "Invalidating CloudFront cache..."
        
        $cfArgs = @("cloudfront", "create-invalidation", "--distribution-id", $CloudFrontDistributionId, "--paths", "/*")
        
        if (![string]::IsNullOrWhiteSpace($Profile)) {
            $cfArgs += @("--profile", $Profile)
        }
        
        try {
            & aws @cfArgs
            if ($LASTEXITCODE -ne 0) { throw "CloudFront invalidation failed" }
            Write-Host "CloudFront cache invalidation initiated." -ForegroundColor Gray
        }
        catch {
            Write-Warning "Failed to invalidate CloudFront cache."
            Write-Host "Please check your CloudFront distribution ID." -ForegroundColor Yellow
        }
    }
    
    # Success message
    Write-Header "Deployment completed successfully!"
    Write-Host ""
    Write-Host "Your app is now available at:" -ForegroundColor Green
    Write-Host "https://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
    Write-Host ""
    
    if (![string]::IsNullOrWhiteSpace($CloudFrontDistributionId)) {
        Write-Host "CloudFront URL will be available shortly (cache propagation may take a few minutes)" -ForegroundColor Yellow
    }
    
    Write-Host "Deployment completed at: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
}

# Execute deployment
try {
    Start-Deployment
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
} 