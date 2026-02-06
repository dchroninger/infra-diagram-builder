import { ContainerNode } from './ContainerNode';
import { DatabaseNode } from './DatabaseNode';
import { MessageBusNode } from './MessageBusNode';
import { MicroserviceNode } from './MicroserviceNode';
import { ExternalServiceNode } from './ExternalServiceNode';
import { UserClientNode } from './UserClientNode';
import { CacheNode } from './CacheNode';

export const nodeTypes = {
  container: ContainerNode,
  database: DatabaseNode,
  messageBus: MessageBusNode,
  microservice: MicroserviceNode,
  externalService: ExternalServiceNode,
  userClient: UserClientNode,
  cache: CacheNode,
};
