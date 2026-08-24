export const CLOUD_MODULES = [
  {
    id: 'github_actions',
    title: '1. GitHub Actions CI/CD Pipeline',
    desc: 'Automatisierte Tests, Build & Deployment bei jedem Git Push.',
    pipelineYaml: `name: CI/CD Pipeline
on: [push]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`
  },
  {
    id: 'aws_lambda',
    title: '2. AWS Lambda Serverless',
    desc: 'Ausführen von Code ohne Server-Infrastruktur verwalten zu müssen.',
    pipelineYaml: `exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hallo aus AWS Lambda Serverless!" })
    };
};`
  }
];
