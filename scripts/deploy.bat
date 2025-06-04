@echo off
setlocal enabledelayedexpansion

echo ============================================
echo          SDIMS Frontend S3 Deployment
echo ============================================

REM Load configuration from deploy.config.js or set defaults
set "BUCKET_NAME=%S3_BUCKET_NAME%"
set "AWS_REGION=%AWS_REGION%"
set "BUILD_DIR=dist"
set "AWS_PROFILE=%AWS_PROFILE%"

REM Check if bucket name is set
if "%BUCKET_NAME%"=="" (
    echo Error: S3_BUCKET_NAME environment variable is not set!
    echo Please set S3_BUCKET_NAME=your-bucket-name
    echo Example: set S3_BUCKET_NAME=my-app-bucket
    pause
    exit /b 1
)

REM Set default region if not specified
if "%AWS_REGION%"=="" set "AWS_REGION=ap-southeast-1"

echo Bucket Name: %BUCKET_NAME%
echo Region: %AWS_REGION%
echo Build Directory: %BUILD_DIR%
echo.

REM Step 1: Clean previous build
echo [1/4] Cleaning previous build...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
    echo Previous build cleaned.
) else (
    echo No previous build found.
)

REM Step 2: Install dependencies (if needed)
echo.
echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies!
    pause
    exit /b 1
)

REM Step 3: Build the application
echo.
echo [3/4] Building the application...
call npm run build
if errorlevel 1 (
    echo Error: Build failed!
    pause
    exit /b 1
)

REM Check if build directory exists
if not exist "%BUILD_DIR%" (
    echo Error: Build directory %BUILD_DIR% not found!
    pause
    exit /b 1
)

REM Step 4: Deploy to S3
echo.
echo [4/4] Deploying to S3...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo Error: AWS CLI is not installed or not found in PATH!
    echo Please install AWS CLI from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    pause
    exit /b 1
)

REM Set AWS profile if specified
if not "%AWS_PROFILE%"=="" (
    set "AWS_PROFILE_OPTION=--profile %AWS_PROFILE%"
) else (
    set "AWS_PROFILE_OPTION="
)

REM Sync files to S3
echo Syncing files to s3://%BUCKET_NAME%...
aws s3 sync "%BUILD_DIR%/" "s3://%BUCKET_NAME%" --region %AWS_REGION% %AWS_PROFILE_OPTION% --delete --exclude "*.map"

if errorlevel 1 (
    echo Error: Failed to sync files to S3!
    echo Please check your AWS credentials and bucket permissions.
    pause
    exit /b 1
)

REM Invalidate CloudFront cache (if distribution ID is provided)
if not "%CLOUDFRONT_DISTRIBUTION_ID%"=="" (
    echo.
    echo Invalidating CloudFront cache...
    aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DISTRIBUTION_ID% --paths "/*" %AWS_PROFILE_OPTION%
    if errorlevel 1 (
        echo Warning: Failed to invalidate CloudFront cache.
        echo Please check your CloudFront distribution ID.
    ) else (
        echo CloudFront cache invalidation initiated.
    )
)

echo.
echo ============================================
echo         Deployment completed successfully!
echo ============================================
echo.
echo Your app is now available at:
echo https://%BUCKET_NAME%.s3-website-%AWS_REGION%.amazonaws.com
echo.

REM If using CloudFront, show CloudFront URL
if not "%CLOUDFRONT_DISTRIBUTION_ID%"=="" (
    echo CloudFront URL will be available shortly (cache propagation may take a few minutes)
)

echo.
pause 