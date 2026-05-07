export type NodeShape =
  | 'cylinder'
  | 'hex'
  | 'diamond'
  | 'parallel'
  | 'card'
  | 'squircle'
  | 'container'
  | 'group'
  | 'zone'

export type NodeCategory =
  | 'data'
  | 'service'
  | 'net'
  | 'client'
  | 'server'
  | 'queue'
  | 'edge'
  | 'docker'
  | 'k8s'
  | 'group'
  | 'copilot'

export interface NodeTypeDef {
  cat: NodeCategory
  shape: NodeShape
  label: string
  sub: string
  icon: string
  w: number
  h: number
  container?: boolean
  semantic?: boolean
  zone?: string
}

export const NODE_TYPES: Record<string, NodeTypeDef> = {
  // ── data ──
  postgres: { cat: 'data', shape: 'cylinder', label: 'Postgres', sub: 'primary db', icon: 'pg', w: 160, h: 96 },
  mysql: { cat: 'data', shape: 'cylinder', label: 'MySQL', sub: 'database', icon: 'my', w: 160, h: 96 },
  mongo: { cat: 'data', shape: 'cylinder', label: 'MongoDB', sub: 'document db', icon: 'mg', w: 160, h: 96 },
  mssql: { cat: 'data', shape: 'cylinder', label: 'MSSQL', sub: 'sql server', icon: 'ms', w: 160, h: 96 },
  redis: { cat: 'data', shape: 'cylinder', label: 'Redis', sub: 'cache', icon: 'rd', w: 160, h: 96 },
  s3: { cat: 'data', shape: 'cylinder', label: 'Object Store', sub: 's3 bucket', icon: 's3', w: 160, h: 96 },
  // ── service ──
  service: { cat: 'service', shape: 'hex', label: 'Service', sub: 'microservice', icon: 'sv', w: 168, h: 96 },
  lambda: { cat: 'service', shape: 'hex', label: 'Function', sub: 'lambda', icon: 'fn', w: 168, h: 96 },
  worker: { cat: 'service', shape: 'hex', label: 'Worker', sub: 'background', icon: 'wk', w: 168, h: 96 },
  // ── net ──
  loadbalancer: { cat: 'net', shape: 'diamond', label: 'Load Balancer', sub: 'lb', icon: 'lb', w: 176, h: 110 },
  gateway: { cat: 'net', shape: 'diamond', label: 'API Gateway', sub: 'gateway', icon: 'gw', w: 176, h: 110 },
  proxy: { cat: 'net', shape: 'diamond', label: 'Proxy', sub: 'reverse proxy', icon: 'px', w: 176, h: 110 },
  firewall: { cat: 'net', shape: 'card', label: 'Firewall', sub: 'security', icon: 'fw', w: 160, h: 92 },
  router: { cat: 'net', shape: 'card', label: 'Router', sub: 'l3', icon: 'rt', w: 160, h: 92 },
  switch: { cat: 'net', shape: 'card', label: 'Switch', sub: 'l2', icon: 'sw', w: 160, h: 92 },
  modem: { cat: 'net', shape: 'card', label: 'Modem', sub: 'wan', icon: 'md', w: 160, h: 92 },
  ap: { cat: 'net', shape: 'card', label: 'Access Point', sub: 'wifi', icon: 'ap', w: 160, h: 92 },
  wlc: { cat: 'net', shape: 'card', label: 'WLC', sub: 'wifi ctrl', icon: 'wl', w: 160, h: 92 },
  ups: { cat: 'net', shape: 'card', label: 'UPS', sub: 'battery', icon: 'up', w: 160, h: 92 },
  // ── client ──
  user: { cat: 'client', shape: 'card', label: 'User', sub: 'end user', icon: 'us', w: 156, h: 88 },
  browser: { cat: 'client', shape: 'card', label: 'Browser', sub: 'web client', icon: 'br', w: 156, h: 88 },
  mobile: { cat: 'client', shape: 'card', label: 'Mobile App', sub: 'ios / android', icon: 'mo', w: 156, h: 88 },
  cli: { cat: 'client', shape: 'card', label: 'CLI', sub: 'terminal', icon: 'cl', w: 156, h: 88 },
  // ── server ──
  server: { cat: 'server', shape: 'card', label: 'Server', sub: 'host', icon: 'sr', w: 160, h: 92 },
  vm: { cat: 'server', shape: 'card', label: 'VM', sub: 'virtual', icon: 'vm', w: 160, h: 92 },
  // ── docker ──
  docker: { cat: 'docker', shape: 'card', label: 'Container', sub: 'docker', icon: 'dk', w: 160, h: 92 },
  compose: { cat: 'docker', shape: 'card', label: 'Compose', sub: 'stack', icon: 'cm', w: 160, h: 92 },
  registry: { cat: 'docker', shape: 'card', label: 'Registry', sub: 'image repo', icon: 'rg', w: 160, h: 92 },
  volume: { cat: 'docker', shape: 'card', label: 'Volume', sub: 'persistent', icon: 'vl', w: 160, h: 92 },
  // ── k8s ──
  k8s: { cat: 'k8s', shape: 'card', label: 'Pod', sub: 'kubernetes', icon: 'k8', w: 160, h: 92 },
  cluster: { cat: 'k8s', shape: 'card', label: 'Cluster', sub: 'control plane', icon: 'cl2', w: 160, h: 92 },
  ingress: { cat: 'k8s', shape: 'card', label: 'Ingress', sub: 'k8s ingress', icon: 'ig', w: 160, h: 92 },
  configmap: { cat: 'k8s', shape: 'card', label: 'ConfigMap', sub: 'config', icon: 'cf', w: 160, h: 92 },
  secret: { cat: 'k8s', shape: 'card', label: 'Secret', sub: 'sealed', icon: 'sc', w: 160, h: 92 },
  pvc: { cat: 'k8s', shape: 'card', label: 'PVC', sub: 'volume claim', icon: 'pv', w: 160, h: 92 },
  // ── queue ──
  kafka: { cat: 'queue', shape: 'parallel', label: 'Kafka', sub: 'event stream', icon: 'kf', w: 172, h: 88 },
  rabbitmq: { cat: 'queue', shape: 'parallel', label: 'RabbitMQ', sub: 'amqp broker', icon: 'rb', w: 172, h: 88 },
  queue: { cat: 'queue', shape: 'parallel', label: 'Queue', sub: 'message q', icon: 'q', w: 172, h: 88 },
  // ── edge ──
  cdn: { cat: 'edge', shape: 'squircle', label: 'CDN', sub: 'edge cache', icon: 'cd', w: 156, h: 88 },
  dns: { cat: 'edge', shape: 'squircle', label: 'DNS', sub: 'name service', icon: 'dn', w: 156, h: 88 },
  // ── containers ──
  group: { cat: 'group', shape: 'group', label: 'Group', sub: 'annotation', icon: 'gr', w: 360, h: 240, container: true, semantic: false },
  cluster_c: { cat: 'k8s', shape: 'container', label: 'Cluster', sub: 'k8s cluster', icon: 'cl2', w: 380, h: 260, container: true, semantic: true },
  namespace_c: { cat: 'k8s', shape: 'container', label: 'Namespace', sub: 'k8s namespace', icon: 'ns', w: 320, h: 220, container: true, semantic: true },
  pod_c: { cat: 'k8s', shape: 'container', label: 'Pod', sub: 'pod (group)', icon: 'k8', w: 260, h: 180, container: true, semantic: true },
  compose_c: { cat: 'docker', shape: 'container', label: 'Compose', sub: 'docker compose', icon: 'cm', w: 300, h: 200, container: true, semantic: true },
  vpc_c: { cat: 'net', shape: 'container', label: 'VPC', sub: 'virtual cloud', icon: 'vp', w: 420, h: 280, container: true, semantic: true },
  subnet_c: { cat: 'net', shape: 'container', label: 'Subnet', sub: 'subnet', icon: 'sb', w: 320, h: 220, container: true, semantic: true },
  zone_c: { cat: 'group', shape: 'zone', label: 'Network Zone', sub: 'security zone', icon: 'zn', w: 360, h: 240, container: true, semantic: false, zone: 'internal' },
  // ── copilot ──
  cp_agent: { cat: 'copilot', shape: 'card', label: 'Agent', sub: 'copilot agent', icon: 'cpa', w: 168, h: 96 },
  cp_topic: { cat: 'copilot', shape: 'card', label: 'Topic', sub: 'conversation', icon: 'cpt', w: 160, h: 92 },
  cp_tool: { cat: 'copilot', shape: 'card', label: 'Tool', sub: 'agent tool', icon: 'cptl', w: 160, h: 92 },
  cp_connector: { cat: 'copilot', shape: 'card', label: 'Connector', sub: 'data connector', icon: 'cpc', w: 160, h: 92 },
  cp_variable: { cat: 'copilot', shape: 'card', label: 'Variable', sub: 'context var', icon: 'cpv', w: 156, h: 88 },
  cp_action: { cat: 'copilot', shape: 'card', label: 'Action', sub: 'flow action', icon: 'cpac', w: 160, h: 92 },
  cp_knowledge: { cat: 'copilot', shape: 'card', label: 'Knowledge', sub: 'kb source', icon: 'cpk', w: 160, h: 92 },
  cp_trigger: { cat: 'copilot', shape: 'card', label: 'Trigger', sub: 'event trigger', icon: 'cptr', w: 160, h: 92 },
}

export interface NodeCategoryDef {
  id: NodeCategory
  label: string
  types: string[]
}

export const NODE_CATEGORIES: NodeCategoryDef[] = [
  { id: 'group', label: 'Containers', types: ['group', 'zone_c', 'cluster_c', 'namespace_c', 'pod_c', 'compose_c', 'vpc_c', 'subnet_c'] },
  { id: 'data', label: 'Data', types: ['postgres', 'mysql', 'mssql', 'mongo', 'redis', 's3'] },
  { id: 'service', label: 'Services', types: ['service', 'lambda', 'worker'] },
  { id: 'queue', label: 'Messaging', types: ['kafka', 'rabbitmq', 'queue'] },
  { id: 'net', label: 'Network', types: ['loadbalancer', 'gateway', 'proxy', 'firewall', 'router', 'switch', 'modem', 'ap', 'wlc', 'ups'] },
  { id: 'docker', label: 'Docker', types: ['docker', 'compose', 'registry', 'volume'] },
  { id: 'k8s', label: 'Kubernetes', types: ['k8s', 'cluster', 'ingress', 'configmap', 'secret', 'pvc'] },
  { id: 'server', label: 'Servers', types: ['server', 'vm'] },
  { id: 'client', label: 'Clients', types: ['user', 'browser', 'mobile', 'cli'] },
  { id: 'edge', label: 'Edge', types: ['cdn', 'dns'] },
  { id: 'copilot', label: 'Copilot Studio', types: ['cp_agent', 'cp_topic', 'cp_trigger', 'cp_tool', 'cp_action', 'cp_connector', 'cp_knowledge', 'cp_variable'] },
]

export const CAT_COLOR_VAR: Record<NodeCategory, string> = {
  data: '--node-data',
  service: '--node-service',
  net: '--node-net',
  client: '--node-client',
  server: '--node-server',
  queue: '--node-queue',
  edge: '--node-edge',
  docker: '--node-docker',
  k8s: '--node-k8s',
  group: '--node-group',
  copilot: '--node-copilot',
}

export const isContainer = (type: string): boolean => !!NODE_TYPES[type]?.container

export function shapeClip(shape: NodeShape): string | undefined {
  switch (shape) {
    case 'hex':
      return 'polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)'
    case 'diamond':
      return 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)'
    case 'parallel':
      return 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)'
    default:
      return undefined
  }
}
