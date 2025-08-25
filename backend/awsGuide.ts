// backend/src/awsGuide.ts
export const awsSelectionGuide = `
## AWS Stack Selection Guide

1. Understand Your Application Context
• Cost Model: Predictable vs. Pay-per-use vs. Idle capacity  
• Time-to-Market: Prototype speed vs. Moderate setup vs. Full control  
• Scalability: Low/steady vs. Auto-scaling vs. Global  
• Ops Overhead: Minimal (serverless) vs. Some vs. High (VMs)  
• Flexibility: Constrained vs. Moderate vs. Maximum control  
• Latency: Low-p95 vs. Medium vs. High tolerance  
• Cold-Start Tolerance: OK vs. Must avoid cold starts  
• Compliance: None vs. Basic vs. Strict  
• Scope Stability: Fixed vs. Evolving

2. Compute Choices
• Minimal Ops → Lambda + API Gateway  
• Moderate control → Fargate (ECS/EKS) or App Runner  
• Full control → EC2 Auto-Scaling Groups  
• Hybrid → EKS/ECS on EC2 nodes

3. Data & Storage
• Static assets → S3 + CloudFront  
• Relational → RDS (Aurora/MySQL/Postgres)  
• NoSQL → DynamoDB  
• Caching → ElastiCache  
• File share → EFS

4. Messaging & Integration
• Pub/Sub → SNS + SQS  
• Streaming → Kinesis  
• Scheduled → EventBridge Scheduler / Step Functions  
• APIs → API Gateway

5. Networking & Security
• VPC/Subnets, ALB/NLB, Route 53, IAM/Cognito

6. Cost & Observability
• Predictable → Reserved/Savings Plans  
• Pay-per-use → Serverless  
• Monitoring → CloudWatch + X-Ray

7. Preference Rules
• If Ops Overhead = high AND Flexibility = maximum → prefer EC2 (ASG) or ECS/EKS over serverless.
• If Cold-Start Must avoid → prefer container/VM solutions.
• If Compliance = strict → prefer managed VMs (EKS, RDS) with dedicated networking.
`;
