# S3 Bucket Setup Script for SDIMS Frontend
# This script creates and configures an S3 bucket for static website hosting

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName = "d-sdims-web",
    [string]$Region = "ap-southeast-1",
    [string]$Profile = $env:AWS_PROFILE,
    [switch]$EnablePublicAccess,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

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

function Start-S3Setup {
    Write-Header "S3 Bucket Setup for SDIMS Frontend"
    
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "  Bucket Name: $BucketName" -ForegroundColor White
    Write-Host "  Region: $Region" -ForegroundColor White
    if (![string]::IsNullOrWhiteSpace($Profile)) {
        Write-Host "  AWS Profile: $Profile" -ForegroundColor White
    }
    Write-Host "  Public Access: $(if($EnablePublicAccess) {'Enabled'} else {'Disabled'})" -ForegroundColor White
    Write-Host ""
    
    # Prepare AWS CLI arguments
    $awsArgs = @()
    if (![string]::IsNullOrWhiteSpace($Profile)) {
        $awsArgs += @("--profile", $Profile)
    }
    
    # Step 1: Create S3 bucket
    Write-Step "Creating S3 bucket..."
    try {
        if ($Region -eq "us-east-1") {
            & aws s3 mb "s3://$BucketName" @awsArgs
        } else {
            & aws s3 mb "s3://$BucketName" --region $Region @awsArgs
        }
        
        if ($LASTEXITCODE -ne 0) { throw "Failed to create bucket" }
        Write-Host "Bucket created successfully." -ForegroundColor Gray
    }
    catch {
        if ($_.Exception.Message -like "*BucketAlreadyExists*" -or $_.Exception.Message -like "*BucketAlreadyOwnedByYou*") {
            Write-Warning "Bucket already exists, continuing with configuration..."
        } else {
            Write-Error "Failed to create bucket: $($_.Exception.Message)"
            exit 1
        }
    }
    
    # Step 2: Enable static website hosting
    Write-Step "Configuring static website hosting..."
    
    $websiteConfig = @"
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
"@
    
    # Save website configuration to temporary file
    $tempConfigFile = [System.IO.Path]::GetTempFileName()
    $websiteConfig | Out-File -FilePath $tempConfigFile -Encoding utf8
    
    try {
        & aws s3api put-bucket-website --bucket $BucketName --website-configuration "file://$tempConfigFile" @awsArgs
        if ($LASTEXITCODE -ne 0) { throw "Failed to configure website hosting" }
        Write-Host "Static website hosting enabled." -ForegroundColor Gray
    }
    catch {
        Write-Error "Failed to configure static website hosting: $($_.Exception.Message)"
        exit 1
    }
    finally {
        Remove-Item $tempConfigFile -ErrorAction SilentlyContinue
    }
    
    # Step 3: Configure public access (if enabled)
    if ($EnablePublicAccess) {
        Write-Step "Configuring public access..."
        
        # Remove public access block
        try {
            & aws s3api delete-public-access-block --bucket $BucketName @awsArgs
            if ($LASTEXITCODE -ne 0) { throw "Failed to remove public access block" }
            Write-Host "Public access block removed." -ForegroundColor Gray
        }
        catch {
            Write-Warning "Failed to remove public access block: $($_.Exception.Message)"
        }
        
        # Create bucket policy for public read access
        $bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
        
        $tempPolicyFile = [System.IO.Path]::GetTempFileName()
        $bucketPolicy | Out-File -FilePath $tempPolicyFile -Encoding utf8
        
        try {
            & aws s3api put-bucket-policy --bucket $BucketName --policy "file://$tempPolicyFile" @awsArgs
            if ($LASTEXITCODE -ne 0) { throw "Failed to set bucket policy" }
            Write-Host "Public read policy applied." -ForegroundColor Gray
        }
        catch {
            Write-Error "Failed to apply bucket policy: $($_.Exception.Message)"
            Write-Host "You may need to configure this manually in AWS Console." -ForegroundColor Yellow
        }
        finally {
            Remove-Item $tempPolicyFile -ErrorAction SilentlyContinue
        }
    }
    
    # Step 4: Set CORS configuration for API calls
    Write-Step "Configuring CORS..."
    
    $corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@
    
    $tempCorsFile = [System.IO.Path]::GetTempFileName()
    $corsConfig | Out-File -FilePath $tempCorsFile -Encoding utf8
    
    try {
        & aws s3api put-bucket-cors --bucket $BucketName --cors-configuration "file://$tempCorsFile" @awsArgs
        if ($LASTEXITCODE -ne 0) { throw "Failed to configure CORS" }
        Write-Host "CORS configuration applied." -ForegroundColor Gray
    }
    catch {
        Write-Warning "Failed to configure CORS: $($_.Exception.Message)"
    }
    finally {
        Remove-Item $tempCorsFile -ErrorAction SilentlyContinue
    }
    
    # Success message
    Write-Header "S3 Bucket Setup Completed!"
    Write-Host ""
    Write-Host "Bucket Details:" -ForegroundColor Green
    Write-Host "  Name: $BucketName" -ForegroundColor White
    Write-Host "  Region: $Region" -ForegroundColor White
    Write-Host "  Website URL: https://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
    Write-Host ""
    
    if ($EnablePublicAccess) {
        Write-Host "✓ Public access enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠ Public access disabled - you may need to enable it manually" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Set environment variable: set S3_BUCKET_NAME=$BucketName" -ForegroundColor White
    Write-Host "2. Run deployment: npm run deploy" -ForegroundColor White
    Write-Host ""
    
    if (!$EnablePublicAccess) {
        Write-Host "To enable public access later, run:" -ForegroundColor Yellow
        Write-Host ".\scripts\setup-s3.ps1 -BucketName $BucketName -EnablePublicAccess" -ForegroundColor White
    }
}

# Execute setup
try {
    Start-S3Setup
}
catch {
    Write-Error "S3 setup failed: $($_.Exception.Message)"
    exit 1
} 