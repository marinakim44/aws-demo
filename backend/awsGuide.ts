// backend/src/awsGuide.ts
export const awsSelectionGuide = `
## AWS Stack Selection Guide

### 1. Understand Your Application Context
• Cost Model: Predictable vs. Pay-per-use vs. Idle capacity  
• Time-to-Market: Prototype speed vs. Moderate setup vs. Full control  
• Scalability: Low/steady vs. Auto-scaling vs. Global  
• Ops Overhead: Minimal (serverless) vs. Some vs. High (VMs)  
• Flexibility: Constrained vs. Moderate vs. Maximum control  
• Latency: Low-p95 vs. Medium vs. High tolerance  
• Cold-Start Tolerance: OK vs. Must avoid cold starts  
• Compliance: None vs. Basic vs. Strict  
• Scope Stability: Fixed vs. Evolving  
• Data Volume & Velocity: KB–MB/day vs. MB–GB/day vs. GB–TB/day  
• Availability Target: 99.9% vs. 99.99% vs. 99.999%  

### 2. Architectural Patterns
• Monolith: Simple CRUD, low ops overhead  
• Modular Monolith: Single deployable, logical modules for future slicing  
• Microservices: Independent services, polyglot, higher ops  
• Serverless & Managed: Functions + managed services, zero infra ops  
• Event-Driven/CQRS: Loose coupling, audit trails, eventual consistency  

### 3. Compute Choices
• Minimal Ops: Lambda + API Gateway (invoke-based billing, automatic scaling)  
• Moderate Control: Fargate (ECS/EKS) or App Runner (container-based, no infra)  
• Full Control: EC2 Auto-Scaling Groups (OS-level control, specialized workloads)  
• Hybrid: EKS/ECS on EC2 nodes (best-of-both, custom AMIs, GPUs)  

### 4. Data & Storage
• Static Assets: S3 + CloudFront (edge caching, low cost)  
• Relational: RDS (Aurora/MySQL/Postgres) – Multi-AZ for HA, Global Tables if needed  
• NoSQL: DynamoDB (On-Demand vs. Provisioned, Global Tables)  
• Caching: ElastiCache (Redis/Memcached), DynamoDB DAX, CloudFront Edge  
• Files & POSIX: EFS (Serverless or provisioned mode), FSx (Windows/Lustre)  
• Data Lake & Warehouse: S3 + Athena, Redshift, Glue (ETL/ELT)  

### 5. Messaging & Integration
• Pub/Sub: SNS + SQS (fan-out, dead-letter queues)  
• Streaming: Kinesis Data Streams, MSK (Kafka)  
• Scheduled & Orchestration: EventBridge Scheduler, Step Functions (stateful workflows)  
• APIs: API Gateway (REST & HTTP APIs), Private API Gateway, AppSync (GraphQL)  

### 6. Networking & Security
• Network Topology: VPC, Public/Private Subnets, NAT Gateways  
• Load Balancing: ALB, NLB, Global Accelerator  
• DNS & Routing: Route 53, Traffic Policies  
• Identity & Access: IAM, IAM Roles, IAM Policies, AWS SSO, Cognito  
• Encryption: KMS CMKs, SSE-S3/SSE-KMS, client-side encryption  
• Security Services: GuardDuty, Inspector, Security Hub, WAF, Shield  

### 7. Cost Management & Observability
• Cost Controls: AWS Budgets, Cost Explorer, Reserved Instances, Savings Plans  
• Tagging Strategy: Environments, Projects, Cost Centers  
• Monitoring: CloudWatch Metrics, Logs, Alarms, X-Ray Tracing  
• Alerting & Dashboards: CloudWatch Dashboards, SNS notifications, PagerDuty  

### 8. Infrastructure as Code (IaC)
• Tools: Terraform, CloudFormation, CDK  
• Best Practices: Modular templates, version control, drift detection  
• CI/CD: GitOps, CodePipeline, GitHub Actions, automated testing, canary/blue-green  

### 9. DR, Backup & Resilience
• Backup: Automated snapshots (RDS, EFS), S3 versioning, Lifecycle Policies  
• Multi-AZ vs. Multi-Region: RDS Multi-AZ, Aurora Global DB, DynamoDB Global Tables, S3 Cross-Region Replication  
• Fault Isolation: Isolated subnets, failover routing, circuit breakers  

### 10. Well-Architected Framework
Align designs with the five pillars:  
• Operational Excellence: Runbooks, game days, run tests  
• Security: Least privilege, continuous compliance, encryption  
• Reliability: Fault injection, recovery planning, automated failover  
• Performance Efficiency: Right-size, caching, up-to-date instance families  
• Cost Optimization: Turn off idle resources, spot instances, right pricing models  

### 11. Preference & Heuristics
• If Ops Overhead = high AND Flexibility = maximum → prefer EC2 (ASG) or ECS/EKS  
• If Cold-Start Must avoid → prefer Fargate/EKS or EC2 ASG  
• If Compliance = strict → isolate in dedicated VPC, use managed instances  
• If Data Volume >= GB–TB/day → incorporate batch/stream and data lake offerings  
• If Availability = 99.999% → multi-Region or edge-powered architecture  

### 12. Continuous Improvement
• Schedule quarterly Well-Architected Reviews  
• Automate cost & performance reports  
• Incorporate user feedback & metrics into architecture iterations  

`;
