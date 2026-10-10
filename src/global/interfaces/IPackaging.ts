interface IComponent {
  id: number;
  name: string;
}

export interface IPackaging {
  id: number;
  name: string;
  components: IComponent[];
}
