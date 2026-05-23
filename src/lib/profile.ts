const stackGroups = [
  {
    label: "Languages",
    items: ["Python", "Java", "TypeScript", "SQL"]
  },
  {
    label: "ML & data",
    items: ["PyTorch", "PySpark", "pandas", "scikit-learn", "MLflow", "BentoML"]
  },
  {
    label: "Backend",
    items: ["FastAPI", "Spring Boot", "Nest.js", "Express.js"]
  },
  {
    label: "Frontend",
    items: ["React", "React Native"]
  },
  {
    label: "Data systems",
    items: ["Airflow", "Postgres", "Redis", "Kafka", "BigQuery", "Redshift"]
  },
  {
    label: "Platform & Infra",
    items: ["AWS", "GCP", "Docker", "Kubernetes", "Helm", "Terraform", ]
  }
];

export const profile = {
  name: "Tiew Kee Hui",
  role: "Senior Software Engineer",
  location: "Singapore",
  origin: "Malaysia",
  email: "tiewkeehui95@hotmail.com",
  github: "https://github.com/tiewkh",
  linkedin: "https://www.linkedin.com/in/tiewkh/",
  resume: "/assets/docs/Resume.pdf",
  headline: "Building recommendation systems, ML platforms, and reliable data products.",
  summary:
    "Hi, I'm Kee Hui, a software engineer based in Singapore. I build full-stack applications, recommendation systems, and data & machine learning pipelines.",
  stackGroups
};

export const siteTitle = "Kee Hui's Portfolio";

export const experience = [
  {
    company: "Open Government Products",
    role: "Senior Software Engineer",
    period: "Sep 2025 - Present",
    location: "Singapore",
    badge: "OGP",
    icon: "ogp",
    summary:
      "Fullstack software engineer building for public good."
  },
  {
    company: "ShopBack",
    role: "Senior Software Engineer (Machine Learning)",
    period: "Jun 2022 - Aug 2025",
    location: "Singapore",
    badge: "SB",
    icon: "shopback",
    summary:
      "Developing recommendation systems across 11 countries, maintaining FastAPI and Kafka services handling about 3 million requests per day, and improving P99 latency by 50% through service migration."
  },
  {
    company: "MoneyLion",
    role: "AI Engineer",
    period: "Mar 2021 - Apr 2022",
    location: "Kuala Lumpur, Malaysia",
    badge: "ML",
    icon: "moneylion",
    summary:
      "Integrated Amazon Personalize recommendations, built Kafka Streams interactive query APIs, developed sampling pipelines, and optimized Aurora RDS to S3 exports from hours to minutes."
  },
  {
    company: "AirAsia",
    role: "Data Scientist",
    period: "Sep 2019 - Feb 2021",
    location: "Kuala Lumpur, Malaysia",
    badge: "AA",
    icon: "airasia",
    summary:
      "Built customer spending dashboards, deployed Airflow and JupyterHub, moved hundreds of gigabytes across systems, and contributed to experimentation infrastructure with Presto and Metabase."
  },
  {
    company: "iFAST Capital",
    role: "R&D Software Engineer",
    period: "Sep 2018 - Aug 2019",
    location: "Kuala Lumpur, Malaysia",
    badge: "iF",
    icon: "ifast",
    summary:
      "Developed a customer-service chatbot using AngularJS, Spring MVC, Python, and AWS; experimented with BERT, Rasa, GloVe, word2vec, and fastText; and conducted churn analysis with XGBoost, Random Forest, and SHAP."
  },
] as const;
