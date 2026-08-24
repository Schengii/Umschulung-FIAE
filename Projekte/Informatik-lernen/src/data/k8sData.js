export const K8S_MODULES = [
  {
    id: 'deployment',
    title: '1. Kubernetes Deployment YAML',
    desc: 'Verwalte replizierte Pods, Rolling Updates & Self-Healing Container.',
    yamlSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: node-api
        image: devgame/api:v2.0
        ports:
        - containerPort: 8080`
  },
  {
    id: 'service',
    title: '2. Kubernetes Service & Ingress',
    desc: 'Exponiere deine Pods nach außen mit LoadBalancer & HTTPS Ingress Routing.',
    yamlSnippet: `apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080`
  }
];
