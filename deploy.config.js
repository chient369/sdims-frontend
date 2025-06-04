// S3 Deployment Configuration
// Modify these values according to your AWS S3 setup

export const deployConfig = {
  // S3 Bucket name where the app will be deployed
  bucketName: process.env.S3_BUCKET_NAME || 'your-bucket-name',
  
  // AWS Region where your S3 bucket is located
  region: process.env.AWS_REGION || 'ap-southeast-1',
  
  // AWS Profile to use (optional)
  profile: process.env.AWS_PROFILE || 'default',
  
  // CloudFront Distribution ID (optional, for cache invalidation)
  cloudFrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
  
  // Build output directory
  buildDir: 'dist',
  
  // Files to exclude from upload
  excludePatterns: [
    '*.map',
    '.DS_Store'
  ]
};

export default deployConfig; 