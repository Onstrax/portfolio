import type { StackFacts } from "../types";

export const stackFacts = {
  groups: [
    { id: "languages", items: ["Python", "Java", "TypeScript", "SQL", "Dart"] },
    {
      id: "frontend",
      items: ["Next.js", "React", "Angular", "Flutter", "Tailwind CSS", "Swing"],
    },
    { id: "backend", items: ["FastAPI", "Spring", "Django", "Flask"] },
    {
      id: "gcp",
      items: [
        "Cloud Run",
        "Compute Engine",
        "Cloud SQL",
        "Cloud Storage",
        "IAM",
        "Artifact Registry",
        "BigQuery",
      ],
    },
    {
      id: "aws",
      items: [
        "EC2",
        "ECS/Fargate",
        "Elastic Beanstalk",
        "S3",
        "RDS/Aurora",
        "ELB",
        "Secrets Manager",
        "CloudWatch",
        "CodeBuild",
        "CodePipeline",
      ],
    },
    {
      id: "devops",
      items: [
        "Git",
        "GitHub Actions",
        "CI/CD",
        "Docker",
        "Docker Compose",
        "Linux",
        "Nginx",
        "Jenkins",
        "SonarQube",
        "SSH",
      ],
    },
    { id: "data", items: ["PostgreSQL", "MySQL", "MongoDB", "pandas", "scikit-learn", "Keras"] },
    {
      id: "security",
      items: ["AES", "RSA", "TLS", "JWT", "Argon2id", "HMAC", "ZKP/LWE", "Kyber", "ECDSA"],
    },
  ],
} as const satisfies StackFacts;
