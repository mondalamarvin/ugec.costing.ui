import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import Select from 'react-select';
import classNames from 'classnames';
import {
  Button,
  Container,
  Field,
  FieldLabel,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SortableItem,
  Spinner,
} from '../ui';

import type { AppDispatch } from '../../store/store';

import {
  fetchMaterialCategories,
  fetchMaterialsByCategory,
  selectCategories,
  selectMaterials,
} from '../../store/slices/materialSlice';

import { fetchMachines, selectMachines } from '../../store/slices/machineSlice';

import {
  generateCostingRequest,
  selectCostingData,
  selectCostingLoading,
  resetCosting,
} from '../../store/slices/costingSlice';

import {
  fetchPackagings,
  selectPackagings,
  selectPackagingsLoading,
} from '@/store/slices/packagingSlice';

import {
  fetchprocessRoutes,
  selectprocessRoutes,
  selectProcessRoutesLoading,
} from '../../store/slices/processRouteSlice';

import {
  setSingleSelectState,
  customErrorStyle,
  setInputState,
  formatNumber,
} from '../../lib';

import type {
  ICostingRequest,
  IInputErrors,
  ILayers,
  IMaterial,
  IPackaging,
  ISelect,
} from '../../global/interfaces';

import { MachineItem } from '../Machines';
import { PackagingItem } from '../Packaging';
// --- Types ---
interface IMachineItem {
  id: number;
  name: string;
  stepOrder: number;
  onRemove?: () => void;
}
interface ICategoryOption {
  value: number;
  label: string;
  category: string;
}

const layerOprions = [
  {
    id: 1,
    type: 'Substrate',
    layerOrder: 1,
    materialId: 2,
    name: 'Aluminum Foil [18.9]',
    coveragePercent: 100,
    tnvc: 100,
  },
  {
    id: 2,
    type: 'Substrate',
    layerOrder: 2,
    materialId: 3,
    name: 'MG Paper [70]',
    coveragePercent: 100,
    tnvc: 100,
  },
  {
    id: 3,
    type: 'Formula',
    layerOrder: 3,
    formulaId: 1,
    name: 'Siegwerk NC 220 -11 [IDS (Gravure) PV 137 White]',
    coveragePercent: 80,
    tnvc: 36,
  },
  {
    id: 4,
    type: 'Formula',
    layerOrder: 4,
    formulaId: 2,
    name: 'NC 220-11 IDS Inks Colored (Gravure)',
    coveragePercent: 60,
    tnvc: 28,
    components: [
      {
        materialId: 17,
        subComponents: [],
      },
      {
        materialId: 18,
        subComponents: [],
      },
      {
        materialId: 10,
        subComponents: [
          { materialId: 11, tnvc: 12.44 },
          { materialId: 12, tnvc: 47.35 },
          { materialId: 13, tnvc: 10.76 },
          { materialId: 14, tnvc: 4.24 },
          { materialId: 15, tnvc: 12.35 },
          { materialId: 16, tnvc: 12.86 },
        ],
      },
    ],
  },
  {
    id: 5,
    type: 'Formula',
    layerOrder: 5,
    formulaId: 3,
    name: 'SW NC 220-11 Over Print (Gravure)',
    coveragePercent: 100,
    tnvc: 28,
  },
  {
    id: 6,
    type: 'Formula',
    layerOrder: 6,
    formulaId: 4,
    name: 'SW WB 503 Primer',
    coveragePercent: 100,
    tnvc: 12,
  },
  {
    id: 7,
    type: 'Formulation',
    layerOrder: 7,
    materialId: 21,
    name: 'Adhesive SF (Monocomponent)',
    coveragePercent: 100,
    tnvc: 100,
  },
];

const orderTypeOptions = [
  { value: 1, label: 'Conesleeves' },
  { value: 2, label: 'Box' },
];

const packagingMaterials = [
  {
    materialId: 22,
    quantity: 10000,
  },
  {
    materialId: 23,
    quantity: 5000,
    components: [
      {
        materialId: 24,
        quantity: 5,
      },
      {
        materialId: 25,
        quantity: 5,
      },
      {
        materialId: 26,
        quantity: 1,
      },
    ],
  },
];

export const mapToProcessRoute = (items: IMachineItem[]) => {
  return items.map((item, index) => ({
    machineId: Number(item.id),
    stepOrder: index + 1,
  }));
};

// --- Main Advanced Calculator Component ---
export const Costing = () => {
  const [errors, setErrors] = useState<IInputErrors>({});
  const [expandedLayer, setExpandedLayer] = useState<number | null>(4);
  const [expandedComp, setExpandedComp] = useState<number | null>(3);
  const [layers, setLayers] = useState<ILayers[]>(layerOprions);
  const [machines, setMachines] = useState<IMachineItem[]>([]);
  const [machineType, setMachineType] = useState<number>(0);
  const [netRollWidth, setNetRollWidth] = useState<number>(559.71);
  const [noOfColors, setNoOfColors] = useState<number>(8);
  const [noOfOuts, setNoOfOuts] = useState<number>(4);
  const [noOfUps, setNoOfUps] = useState<number>(3);
  const [openAddMachineSheet, setOpenAddMachineSheet] =
    useState<boolean>(false);
  const [openAddMaterialSheet, setOpenAddMaterialSheet] =
    useState<boolean>(false);
  const [openAddPackagingComponent, setOpenAddPackagingComponent] =
    useState<boolean>(false);
  const [orderType, setOrderType] = useState<number>(0);
  const [quantityOrder, setQuantityOrder] = useState<number>(2000000);
  const [repeatLength, setRepeatLength] = useState<number>(533.05);
  const [pcsPerBox, setPcsPerBox] = useState<number>(5000);
  const [spreadHeight, setSpreadHeight] = useState<number>(173.41);
  const [spreadWidth, setSpreadWidth] = useState<number>(180.38);
  const [totalImages, setTotalImages] = useState<number>(12);
  const [vehicle, setVehicle] = useState<string>('L300');
  const [isPackExpanded, setPackIsExpanded] = useState<boolean>(false);
  const [packagings, setPackagings] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const costingData = useSelector(selectCostingData);
  const costingLoading = useSelector(selectCostingLoading);
  const machineOptions = useSelector(selectMachines);
  const materialCategories = useSelector(selectCategories);
  const materials = useSelector(selectMaterials);
  const packagingData = useSelector(selectPackagings);
  const processRoutes = useSelector(selectprocessRoutes);
  const processRoutesLoading = useSelector(selectProcessRoutesLoading);

  useEffect(() => {
    dispatch(fetchMachines());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMaterialCategories());
  }, [dispatch]);

  useEffect(() => {
    if (orderType !== 0) {
      dispatch(fetchprocessRoutes(orderType));
      dispatch(fetchPackagings(orderType));
    }
  }, [orderType, dispatch]);

  useEffect(() => {
    if (processRoutes) {
      setMachines(processRoutes);
    }
  }, [processRoutes]);

  useEffect(() => {
    if (packagingData) {
      setPackagings(packagingData);
    }
  }, [packagingData]);

  useEffect(() => {
    dispatch(fetchMaterialsByCategory(8));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const selectMachineOptions = useMemo(() => {
    if (!machineOptions) return [];
    const selectedIds = new Set(machines.map((m) => m.id));

    return (machineOptions as IMachineItem[])
      .filter((m) => !selectedIds.has(m.id))
      .map((m) => ({
        value: m.id,
        label: m.name,
      }));
  }, [machineOptions, machines]);

  const selectPackagingOptions = useMemo(() => {
    if (!materials || !packagings) return [];

    const selectedIds = new Set(materials.map((m: IMaterial) => m.value));

    return packagings
      .filter((p: IPackaging) => !selectedIds.has(p.id))
      .flatMap((p: IPackaging) => {
        const packagingOption = {
          value: p.id,
          label: p.name,
        };

        const componentOptions =
          p.components?.length > 0
            ? p.components.map((component) => ({
                value: component.id,
                label: component.name,
              }))
            : [];

        return [packagingOption, ...componentOptions];
      });
  }, [materials, packagings]);

  const handleMachineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setMachines((prevMachines) => {
      const oldIndex = prevMachines.findIndex((m) => m.id === active.id);
      const newIndex = prevMachines.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prevMachines, oldIndex ?? 0, newIndex ?? 0);
      return reordered.map((machine, index) => ({
        ...machine,
        stepOrder: index + 1,
      }));
    });
    dispatch(resetCosting());
  };

  const handleLayerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setLayers((prevLayers) => {
      const oldIndex = prevLayers.findIndex((m) => m.id === active.id);
      const newIndex = prevLayers.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prevLayers, oldIndex, newIndex);
      return reordered.map((layer, index) => ({
        ...layer,
        layerOrder: index,
      }));
    });
  };

  const removeItemClickHandler = (id: number) =>
    setMachines((prev) => prev.filter((item) => item.id !== id));

  const removePackagingItemHandler = (index: number) =>
    setPackagings((prev) => prev.filter((_, idx) => idx !== index));

  const removePackagingComponentHandler = (
    itemIndex: number,
    componentIndex: number,
  ) =>
    setPackagings((prev) =>
      prev.map((item, idx) =>
        idx === itemIndex
          ? {
              ...item,
              components: item.components.filter(
                (_: any, cidx: any) => cidx !== componentIndex,
              ),
            }
          : item,
      ),
    );

  const addLayerClickHandler = useCallback(
    (id: number) => {
      if (!id) return;
      const optionToAdd = (machineOptions as IMachineItem[])?.find(
        (m) => m.id === id,
      );

      if (!optionToAdd) return;
      setMachines((prev) => {
        if (prev.some((m) => m.id === id)) return prev;

        return [
          ...prev,
          {
            ...optionToAdd,
            machineId: optionToAdd.id,
            stepOrder: prev.length + 1,
          },
        ];
      });
      setOpenAddMachineSheet(false);
    },
    [machineOptions],
  );

  const submitCostingHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: ICostingRequest = {
      orderType: orderType,
      quantityOrder: quantityOrder,
      spreadWidth: spreadWidth,
      spreadHeight: spreadHeight,
      noOfOuts: noOfOuts,
      noOfUps: noOfUps,
      totalImages: totalImages,
      netRollWidth: netRollWidth,
      repeatLength: repeatLength,
      pcsPerBox: pcsPerBox,
      noOfColor: noOfColors,
      processRoute: mapToProcessRoute(machines),
      layers: layers,
      packagingMaterials: packagingMaterials,
      vehicle: 'L300',
    };
    dispatch(generateCostingRequest(data));
  };

  return (
    <>
      <Sheet open={openAddMachineSheet} onOpenChange={setOpenAddMachineSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Machine To Process Route</SheetTitle>
          </SheetHeader>
          <Container>
            <div className='grid gap-6 mb-4 lg:grid-cols-0'>
              <div>
                <label
                  htmlFor='machineType'
                  className={classNames(
                    'block mb-2 text-sm font-medium',
                    errors.machineType ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  Machine Name
                </label>
                <Select<ISelect>
                  id='machineType'
                  options={selectMachineOptions}
                  onChange={(type) => {
                    setSingleSelectState(
                      setMachineType,
                      setErrors,
                      'machineType',
                      type,
                    );
                  }}
                  styles={customErrorStyle('machineType', errors.layerType)}
                />
              </div>
            </div>
            <div className='py-4'>
              <Button
                type='button'
                className='py-4'
                onClick={() => addLayerClickHandler(machineType)}
              >
                Add To Process Routing
              </Button>
            </div>
          </Container>
        </SheetContent>
      </Sheet>
      <Sheet open={openAddMaterialSheet} onOpenChange={setOpenAddMaterialSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Material To Layers</SheetTitle>
          </SheetHeader>
          <Container>
            <div className='grid gap-6 mb-4 lg:grid-cols-0'>
              <div>
                <label
                  htmlFor='machineType'
                  className={classNames(
                    'block mb-2 text-sm font-medium',
                    errors.machineType ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  Material Name
                </label>
                <Select<ISelect>
                  id='machineType'
                  options={selectMachineOptions}
                  onChange={(type) => {
                    setSingleSelectState(
                      setMachineType,
                      setErrors,
                      'machineType',
                      type,
                    );
                  }}
                  styles={customErrorStyle('machineType', errors.layerType)}
                />
              </div>
            </div>
            <div className='py-4'>
              <Button
                type='button'
                className='py-4'
                onClick={() => addLayerClickHandler(machineType)}
              >
                Add To Layers
              </Button>
            </div>
          </Container>
        </SheetContent>
      </Sheet>
      <Sheet
        open={openAddPackagingComponent}
        onOpenChange={setOpenAddPackagingComponent}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Packaging Item</SheetTitle>
          </SheetHeader>
          <Container>
            <div className='grid gap-6 mb-4 lg:grid-cols-0'>
              <div>
                <label
                  htmlFor='materialName'
                  className={classNames(
                    'block mb-2 text-sm font-medium',
                    errors.materialName ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  Material Name
                </label>
                <Select<ISelect>
                  id='materialName'
                  options={selectPackagingOptions}
                  onChange={(type) => {
                    setSingleSelectState(
                      setMachineType,
                      setErrors,
                      'materialName',
                      type,
                    );
                  }}
                  styles={customErrorStyle('materialName', errors.layerType)}
                />
              </div>
            </div>
            <div className='py-4'>
              <Button
                type='button'
                className='py-4'
                onClick={() => addLayerClickHandler(machineType)}
              >
                Add New Component
              </Button>
            </div>
          </Container>
        </SheetContent>
      </Sheet>
      <Sheet
        open={openAddPackagingComponent}
        onOpenChange={setOpenAddPackagingComponent}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Component to Packaging</SheetTitle>
          </SheetHeader>
          <Container>
            <div className='grid gap-6 mb-4 lg:grid-cols-0'>
              <div>
                <label
                  htmlFor='materialName'
                  className={classNames(
                    'block mb-2 text-sm font-medium',
                    errors.materialName ? 'text-red-600' : 'text-gray-900',
                  )}
                >
                  Material Name
                </label>
                <Select<ISelect>
                  id='materialName'
                  options={selectPackagingOptions}
                  onChange={(type) => {
                    setSingleSelectState(
                      setMachineType,
                      setErrors,
                      'materialName',
                      type,
                    );
                  }}
                  styles={customErrorStyle('materialName', errors.layerType)}
                />
              </div>
            </div>
            <div className='py-4'>
              <Button
                type='button'
                className='py-4'
                onClick={() => addLayerClickHandler(machineType)}
              >
                Add New Component
              </Button>
            </div>
          </Container>
        </SheetContent>
      </Sheet>
      <div className='min-h-screen bg-slate-100 p-6 text-gray-800'>
        {/* Title Bar */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Costing App: Advanced Calculator
          </h1>
          <p className='text-sm text-gray-500'>
            Dashboard / Calculator /{' '}
            <span className='text-gray-800 font-medium'>New</span>
          </p>
        </div>

        {/* Main Grid: Left 2 cols, Right 1 col */}
        <form onSubmit={submitCostingHandler}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* LEFT COLUMN */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Section 1: Job Overview & Imposition */}
              <div className='bg-white p-5 rounded-lg border border-gray-200 shadow-sm'>
                <h2 className='text-lg font-bold text-gray-800 mb-4'>
                  Job Overview & Imposition
                </h2>

                <div className='grid grid-cols-2 sm:grid-cols-8 gap-4'>
                  <div className='col-span-2'>
                    <label
                      htmlFor='orderType'
                      className={classNames(
                        'block text-xs font-semibold text-gray-600 mb-2',
                        errors.orderType ? 'text-red-600' : 'text-gray-900',
                      )}
                    >
                      Order Type
                    </label>
                    <Select<ISelect>
                      classNames={{
                        control: () => '!min-h-8 !h-8 rounded-md !border-input',
                        valueContainer: () => '!py-0 !h-full',
                        indicatorsContainer: () => '!h-full',
                        input: () => '!m-0 !p-0',
                      }}
                      id='orderType'
                      options={orderTypeOptions}
                      onChange={(order) =>
                        setSingleSelectState(
                          setOrderType,
                          setErrors,
                          'orderType',
                          order,
                        )
                      }
                      styles={customErrorStyle('orderType', errors.orderType)}
                    />
                  </div>

                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.quantityOrder}>
                      <FieldLabel
                        htmlFor='quantityOrder'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Quantity
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='quantityOrder'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setQuantityOrder,
                            setErrors,
                            'quantityOrder',
                          )
                        }
                        value={quantityOrder}
                        aria-invalid={errors && errors.quantityOrder}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.noOfColors}>
                      <FieldLabel
                        htmlFor='noOfColors'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Number Of Colors
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='noOfColors'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setNoOfColors,
                            setErrors,
                            'noOfColors',
                          )
                        }
                        value={noOfColors}
                        aria-invalid={errors && errors.noOfColors}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.spreadWidth}>
                      <FieldLabel
                        htmlFor='spreadWidth'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Spread Width
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='spreadWidth'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setSpreadWidth,
                            setErrors,
                            'spreadWidth',
                          )
                        }
                        value={spreadWidth}
                        aria-invalid={errors && errors.spreadWidth}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.spreadHeight}>
                      <FieldLabel
                        htmlFor='spreadHeight'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Spread Height
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='spreadHeight'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setSpreadHeight,
                            setErrors,
                            'spreadHeight',
                          )
                        }
                        value={spreadHeight}
                        aria-invalid={errors && errors.spreadHeight}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.noOfUps}>
                      <FieldLabel
                        htmlFor='noOfUps'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Number Of Ups
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='noOfUps'
                        type='number'
                        onChange={(e) =>
                          setInputState(e, setNoOfUps, setErrors, 'noOfUps')
                        }
                        value={noOfUps}
                        aria-invalid={errors && errors.noOfUps}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.noOfOuts}>
                      <FieldLabel
                        htmlFor='noOfOuts'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Number Of Outs
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='noOfOuts'
                        type='number'
                        onChange={(e) =>
                          setInputState(e, setNoOfOuts, setErrors, 'noOfOuts')
                        }
                        value={noOfOuts}
                        aria-invalid={errors && errors.noOfOuts}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.netRollWidth}>
                      <FieldLabel
                        htmlFor='netRollWidth'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Net Roll Width
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='netRollWidth'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setNetRollWidth,
                            setErrors,
                            'netRollWidth',
                          )
                        }
                        value={netRollWidth}
                        aria-invalid={errors && errors.netRollWidth}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.repeatLength}>
                      <FieldLabel
                        htmlFor='repeatLength'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Repeat Length
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='repeatLength'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setRepeatLength,
                            setErrors,
                            'repeatLength',
                          )
                        }
                        value={repeatLength}
                        aria-invalid={errors && errors.repeatLength}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.totalImages}>
                      <FieldLabel
                        htmlFor='totalImages'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Total Images
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='totalImages'
                        type='number'
                        onChange={(e) =>
                          setInputState(
                            e,
                            setTotalImages,
                            setErrors,
                            'totalImages',
                          )
                        }
                        value={totalImages}
                        aria-invalid={errors && errors.totalImages}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.pcsPerBox}>
                      <FieldLabel
                        htmlFor='pcsPerBox'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Pcs/Box
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='pcsPerBox'
                        type='number'
                        onChange={(e) =>
                          setInputState(e, setPcsPerBox, setErrors, 'pcsPerBox')
                        }
                        value={pcsPerBox}
                        aria-invalid={errors && errors.pcsPerBox}
                      />
                    </Field>
                  </div>
                  <div className='col-span-2'>
                    <Field data-invalid={errors && errors.vehicle}>
                      <FieldLabel
                        htmlFor='vehicle'
                        className='block text-xs font-semibold text-gray-600 mb-0'
                      >
                        Vehicle
                      </FieldLabel>
                      <Input
                        className='w-full h-8 border border-gray-300 rounded-sm px-3 text-sm font-semibold'
                        name='vehicle'
                        placeholder='L300'
                        onChange={(e) =>
                          setInputState(e, setVehicle, setErrors, 'vehicle')
                        }
                        value={vehicle}
                        aria-invalid={errors && errors.vehicle}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section 2: Process Routing (Step Sequencer) */}
              <div className='bg-white p-5 rounded-lg border border-gray-200 shadow-sm'>
                {/* Card Header */}
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h2 className='text-md font-bold text-gray-800'>
                      Process Routing (Step Sequencer)
                    </h2>
                    <p className='text-xs text-gray-400'>(Draggable Stack)</p>
                  </div>
                  <Button
                    type='button'
                    onClick={() => setOpenAddMachineSheet(!openAddMachineSheet)}
                    className='flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded'
                  >
                    <Plus className='w-3.5 h-3.5' /> Add Machine
                  </Button>
                </div>

                {/* Drag-and-Drop Container */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleMachineDragEnd}
                >
                  <SortableContext
                    items={machines.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className='space-y-3'>
                      {machines.map((machine, index) => {
                        const match = costingData?.machines?.[index];

                        return (
                          <SortableItem key={machine.id} id={machine.id}>
                            {({ dragHandleProps }) => (
                              <MachineItem
                                machine={machine}
                                index={index}
                                match={match}
                                dragHandleProps={dragHandleProps}
                                onRemove={() =>
                                  removeItemClickHandler(machine.id)
                                }
                              />
                            )}
                          </SortableItem>
                        );
                      })}
                    </div>

                    {/* Summary / Loading Footer Section */}
                    <div
                      className={`mt-4 pt-3 border-t border-gray-100 flex items-center ${
                        processRoutesLoading ? 'justify-center' : 'justify-end'
                      }`}
                    >
                      {processRoutesLoading ? (
                        <div className='flex items-center gap-2 text-sm text-gray-500 py-2'>
                          <Spinner />
                          <span>Loading, please wait...</span>
                        </div>
                      ) : (
                        machines.length > 0 && (
                          /* Match the right-padding of MachineItem (e.g., pr-12 or pr-16) to align total directly under individual row costs */
                          <div className='flex items-center gap-3 pr-12'>
                            <span className='font-semibold text-gray-700 text-sm'>
                              Total Machine Cost:
                            </span>
                            <span className='font-bold text-gray-900 text-base tabular-nums'>
                              {'\u20B1'}
                              {costingData
                                ? formatNumber(costingData?.totalMachineCost, 2)
                                : '0.00'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Section 3: Packaging Materials */}
              <div className='bg-white p-5 rounded-lg border border-gray-200 shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h2 className='text-md font-bold text-gray-800'>
                      Packaging Materials & Total Cost
                    </h2>
                  </div>
                  <Button
                    type='button'
                    onClick={() =>
                      setOpenAddPackagingComponent(!openAddPackagingComponent)
                    }
                    className='flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded'
                  >
                    <Plus className='w-3.5 h-3.5' /> Add Packaging Material
                  </Button>
                </div>
                {costingData && (
                  <>
                    <div className='bg-white border border-gray-200 rounded-md mb-2 shadow-sm p-3 transition-all'>
                      <h3 className='text-lg font-bold text-gray-700'>
                        Delivery Rate
                      </h3>
                      <div>
                        <span>Vehicle: {costingData.delivery.vehicleName}</span>
                      </div>
                      <div>
                        <span>
                          Max Capacity:{' '}
                          {costingData.delivery.maxCapacity.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>
                          Total Trips: {costingData.delivery.totalTrips}
                        </span>
                      </div>
                      <div>
                        <span>
                          Price per Trip:{' '}
                          {costingData.delivery.costPerTrip.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span>
                          Total Delivery Cost:{' '}
                          {costingData.delivery.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500'>
                        Final Assembly & Packaging: (
                        {(
                          quantityOrder /
                          pcsPerBox /
                          costingData.delivery.totalTrips
                        ).toLocaleString()}{' '}
                        boxes per trip)
                      </p>
                    </div>
                    <div className='bg-white border border-gray-200 rounded-md mb-2 shadow-sm p-3 transition-all'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-lg font-bold text-gray-700'>
                          Packaging Materials
                        </h3>
                      </div>
                      {costingData.packaging.map((p: any, index: number) => (
                        <PackagingItem
                          key={p.name}
                          item={p}
                          index={index}
                          isComputed={true}
                          isPackExpanded={isPackExpanded === p.name}
                          onAddComponent={() =>
                            setOpenAddPackagingComponent(true)
                          }
                          onToggle={() =>
                            setPackIsExpanded(
                              isPackExpanded === p.name ? null : p.name,
                            )
                          }
                          onDelete={() => removePackagingItemHandler(p)}
                          onDeleteComponent={(componentIndex) =>
                            removePackagingComponentHandler(
                              index,
                              componentIndex,
                            )
                          }
                        />
                      ))}
                      <div className='text-right'>
                        <span className='text-xs text-gray-400 block uppercase font-medium'>
                          Total Packaging Cost
                        </span>

                        <span className='text-lg font-bold text-gray-800'>
                          {'\u20B1'}
                          {formatNumber(
                            costingData.packaging.reduce(
                              (sum: number, item: any) =>
                                sum +
                                (Number(item.totalCost) +
                                  Number(item.totalComponentCost) || 0),
                              0,
                            ),
                            2,
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {packagings &&
                  !costingData &&
                  packagings.map((p: any, index: number) => {
                    return (
                      <PackagingItem
                        key={p.name}
                        item={p}
                        index={index}
                        isComputed={false}
                        isPackExpanded={isPackExpanded === p.name}
                        onAddComponent={() =>
                          setOpenAddPackagingComponent(true)
                        }
                        onToggle={() =>
                          setPackIsExpanded(
                            isPackExpanded === p.name ? null : p.name,
                          )
                        }
                        onDelete={() => removePackagingItemHandler(index)}
                        onDeleteComponent={(componentIndex) =>
                          removePackagingComponentHandler(index, componentIndex)
                        }
                      />
                    );
                  })}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className='bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between'>
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h2 className='text-md font-bold text-gray-800'>
                      Substrate & Coating Layers
                    </h2>
                    <p className='text-xs text-gray-400'>(Draggable Stack)</p>
                  </div>
                  <Button
                    onClick={() => setOpenAddMaterialSheet(true)}
                    className='flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded'
                  >
                    <Plus className='w-3.5 h-3.5' /> Add Layer
                  </Button>
                </div>

                {/* Draggable & Hierarchical Layer Stack */}
                <div className='space-y-2'>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleLayerDragEnd}
                  >
                    <SortableContext
                      items={layers && layers.map((l) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {layers.map((layer, index) => {
                        const isExpanded = expandedLayer === layer.id;

                        return (
                          <SortableItem key={layer.id} id={layer.id}>
                            {({ dragHandleProps }) => (
                              <div className='border border-gray-200 rounded-md overflow-hidden bg-white mb-2'>
                                {/* Layer Header */}
                                <div
                                  className={`flex items-center justify-between p-3 cursor-pointer text-sm font-semibold ${
                                    isExpanded
                                      ? 'bg-gray-100 border-b border-gray-200'
                                      : 'bg-gray-50 hover:bg-gray-100'
                                  }`}
                                  onClick={() =>
                                    setExpandedLayer(
                                      isExpanded ? null : layer?.id,
                                    )
                                  }
                                >
                                  <div className='flex items-center gap-2'>
                                    {/* Attached dragHandleProps & e.stopPropagation() */}
                                    <button
                                      type='button'
                                      {...dragHandleProps.attributes}
                                      {...dragHandleProps.listeners}
                                      className='cursor-grab text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200/50'
                                      onClick={(e) => e.stopPropagation()} // Stops accordion toggling on drag
                                    >
                                      <GripVertical className='w-4 h-4 text-gray-400' />
                                    </button>
                                    <span className='font-bold text-gray-700'>
                                      Layer {index + 1}
                                    </span>
                                    <span className='font-semibold text-gray-800'>
                                      {layer.name}
                                    </span>
                                  </div>

                                  {layer.components &&
                                    (isExpanded ? (
                                      <ChevronDown className='w-4 h-4 text-gray-500' />
                                    ) : (
                                      <ChevronRight className='w-4 h-4 text-gray-500' />
                                    ))}
                                </div>

                                {!isExpanded && layer.components && (
                                  <div className='p-3 bg-gray-50/50 space-y-3'>
                                    <div className='flex justify-between items-center text-xs text-gray-500 border-b pb-2'>
                                      <span>
                                        Formula{' '}
                                        {layer.name
                                          .split('[')[1]
                                          ?.replace(']', '') || ''}
                                      </span>
                                      <div>
                                        <span className='mr-3'>
                                          Coverage{' '}
                                          <b>{layer.coveragePercent}</b>
                                        </span>
                                        <span>
                                          TNVC <b>{layer.tnvc}</b>
                                        </span>
                                      </div>
                                    </div>

                                    <div className='pl-2 space-y-2 text-xs'>
                                      {layer.components.map((comp) => {
                                        const isCompExpanded =
                                          expandedComp === comp.materialId;
                                        return (
                                          <div
                                            key={comp.materialId}
                                            className='rounded border border-gray-200 bg-white p-2'
                                          >
                                            <div
                                              className='flex items-center gap-1 cursor-pointer font-medium text-gray-700'
                                              onClick={() =>
                                                setExpandedComp(
                                                  isCompExpanded
                                                    ? null
                                                    : comp.materialId,
                                                )
                                              }
                                            >
                                              {comp.subComponents ? (
                                                isCompExpanded ? (
                                                  <ChevronDown className='w-3 h-3' />
                                                ) : (
                                                  <ChevronRight className='w-3 h-3' />
                                                )
                                              ) : (
                                                <span className='w-3' />
                                              )}
                                              <span>{comp.materialId}</span>
                                            </div>

                                            {isCompExpanded &&
                                              comp.subComponents && (
                                                <div className='mt-2 pl-6 space-y-1 text-gray-600 bg-gray-50 p-2 rounded'>
                                                  {comp.subComponents.map(
                                                    (sub, i) => (
                                                      <div
                                                        key={i}
                                                        className='flex justify-between'
                                                      >
                                                        <span>
                                                          {sub.materialId}
                                                        </span>
                                                        <span className='font-semibold text-gray-800'>
                                                          {sub.tnvc}
                                                        </span>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* Bottom Total Actions */}
              <div className='mt-6 pt-4 border-t border-gray-200 space-y-3'>
                {/* <button className='w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2 rounded'>
              Recalculate Totals
            </button> */}
                <Button
                  type='submit'
                  size='lg'
                  className='w-full bg-slate-800 hover:bg-slate-900 text-white text-xs py-6.5 rounded flex flex-col items-center justify-center'
                >
                  <span className='font-semibold'>
                    {costingLoading
                      ? 'Calculating Please Wait...'
                      : 'Generate Costing Request'}
                  </span>
                  <span className='text-[10px] text-gray-400'>
                    Estimated Cost: {'\u20B1'}
                    {costingData
                      ? (
                          costingData.totalMachineCost +
                          costingData.totalMaterialCost +
                          costingData.totalMachineCost +
                          costingData.totalDeliveryCost
                        ).toLocaleString()
                      : 0}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
