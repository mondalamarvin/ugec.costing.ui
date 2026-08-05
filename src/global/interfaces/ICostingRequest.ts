export interface IProcessRoute {
  machineId: number;
  stepOrder: number;
}

export interface ILayers {
  id: number;
  type: string;
  layerOrder: number;
  materialId?: number;
  formulaId?: number;
  name: string;
  coveragePercent: number;
  tnvc: number;
  components?: IComponents[];
}

interface IComponents {
  materialId: number;
  subComponents?: ISubComponents[];
}

interface ISubComponents {
  materialId: number;
  tnvc: number;
}

export interface ICostingRequest {
  orderType: string;
  quantityOrder: number;
  spreadWidth: number;
  spreadHeight: number;
  noOfOuts: number;
  noOfUps: number;
  totalImages: number;
  netRollWidth: number;
  repeatLength: number;
  pcsPerBox: number;
  noOfColor: number;
  vehicle: string;
  processRoute: IProcessRoute[];
  layers: ILayers[];
}
